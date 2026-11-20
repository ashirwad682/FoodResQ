from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from .models import DonorProfile, VolunteerProfile, UserRole

User = get_user_model()


class DonorProfileSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='organization_name', required=False, allow_blank=True)
    food_license_number = serializers.CharField(source='fssai_license', required=False, allow_blank=True)

    class Meta:
        model = DonorProfile
        fields = [
            'id',
            'organization_name',
            'business_name',
            'donor_type',
            'address',
            'latitude',
            'longitude',
            'fssai_license',
            'food_license_number',
            'contact_person',
            'total_donations_count',
            'total_donations_kg',
        ]
        read_only_fields = ['id', 'total_donations_count', 'total_donations_kg']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerProfile
        fields = [
            'id',
            'vehicle_type',
            'vehicle_number',
            'max_distance_km',
            'address',
            'is_available',
            'rating',
            'total_pickups_completed',
            'current_latitude',
            'current_longitude',
            'emergency_contact',
        ]
        read_only_fields = ['id', 'rating', 'total_pickups_completed']


class UserSerializer(serializers.ModelSerializer):
    donor_profile = DonorProfileSerializer(read_only=True)
    volunteer_profile = VolunteerProfileSerializer(read_only=True)
    organization = serializers.SerializerMethodField()
    address = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'address',
            'avatar_url',
            'is_verified',
            'created_at',
            'donor_profile',
            'volunteer_profile',
            'organization',
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    @extend_schema_field(serializers.CharField(allow_blank=True))
    def get_address(self, obj):
        if hasattr(obj, 'donor_profile') and obj.donor_profile.address:
            return obj.donor_profile.address
        if hasattr(obj, 'organization') and obj.organization.address:
            return obj.organization.address
        if hasattr(obj, 'volunteer_profile') and getattr(obj.volunteer_profile, 'address', None):
            return obj.volunteer_profile.address
        return ''

    @extend_schema_field(serializers.DictField(allow_null=True))
    def get_organization(self, obj):
        if hasattr(obj, 'organization'):
            from organizations.serializers import OrganizationBriefSerializer
            return OrganizationBriefSerializer(obj.organization).data
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Optional profile fields during registration
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    donor_type = serializers.CharField(write_only=True, required=False, default='RESTAURANT')
    vehicle_type = serializers.CharField(write_only=True, required=False, default='BIKE')
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    latitude = serializers.FloatField(write_only=True, required=False, default=0.0)
    longitude = serializers.FloatField(write_only=True, required=False, default=0.0)

    # Optional nested profile objects from frontend
    donor_profile = serializers.DictField(write_only=True, required=False)
    organization = serializers.DictField(write_only=True, required=False)
    volunteer_profile = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'role',
            'phone_number',
            'avatar_url',
            'organization_name',
            'donor_type',
            'vehicle_type',
            'address',
            'latitude',
            'longitude',
            'donor_profile',
            'organization',
            'volunteer_profile',
        ]

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_confirm = attrs.get('password_confirm')
        if pw_confirm and pw != pw_confirm:
            raise serializers.ValidationError({"password": "Password confirmation does not match."})
        
        # Verify username uniqueness
        username = attrs.get('username')
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
            
        # Verify email uniqueness
        email = attrs.get('email')
        if email and User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "A user with this email address already exists."})
            
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        donor_profile_data = validated_data.pop('donor_profile', {})
        org_data = validated_data.pop('organization', {})
        volunteer_profile_data = validated_data.pop('volunteer_profile', {})

        org_name = (
            validated_data.pop('organization_name', '')
            or donor_profile_data.get('business_name', '')
            or org_data.get('name', '')
        )
        fssai = (
            donor_profile_data.get('food_license_number', '')
            or donor_profile_data.get('fssai_license', '')
        )
        donor_type = validated_data.pop('donor_type', 'RESTAURANT')
        vehicle_type = (
            validated_data.pop('vehicle_type', 'BIKE')
            or volunteer_profile_data.get('vehicle_type', 'BIKE')
        )
        address = (
            validated_data.pop('address', '')
            or donor_profile_data.get('address', '')
            or org_data.get('address', '')
            or volunteer_profile_data.get('address', '')
        )
        lat = validated_data.pop('latitude', 0.0)
        lng = validated_data.pop('longitude', 0.0)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', UserRole.DONOR),
            phone_number=validated_data.get('phone_number', ''),
            avatar_url=validated_data.get('avatar_url', ''),
        )

        # Auto-create related profiles based on chosen role
        if user.role == UserRole.DONOR:
            DonorProfile.objects.create(
                user=user,
                organization_name=org_name or f"{user.first_name}'s Kitchen",
                donor_type=donor_type,
                address=address,
                latitude=lat,
                longitude=lng,
                fssai_license=fssai,
                contact_person=user.get_full_name() or user.username
            )
        elif user.role == UserRole.VOLUNTEER:
            max_dist = volunteer_profile_data.get('max_distance_km', 15)
            VolunteerProfile.objects.create(
                user=user,
                vehicle_type=vehicle_type,
                max_distance_km=float(max_dist) if max_dist else 15,
                address=address,
                current_latitude=lat,
                current_longitude=lng
            )
        elif user.role == UserRole.NGO:
            from organizations.models import Organization
            reg_num = org_data.get('registration_number', '')
            cap = org_data.get('capacity_kg', 200.0)
            Organization.objects.create(
                user=user,
                name=org_name or f"{user.first_name or user.username} Relief Org",
                registration_number=reg_num,
                contact_email=user.email,
                phone=user.phone_number or '',
                address=address,
                max_capacity_kg=float(cap) if cap else 200.0,
                latitude=lat,
                longitude=lng
            )

        return user
