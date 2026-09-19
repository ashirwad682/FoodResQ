from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from .models import DonorProfile, VolunteerProfile, UserRole

User = get_user_model()


class DonorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonorProfile
        fields = [
            'id',
            'organization_name',
            'donor_type',
            'address',
            'latitude',
            'longitude',
            'fssai_license',
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
            'avatar_url',
            'is_verified',
            'created_at',
            'donor_profile',
            'volunteer_profile',
            'organization',
        ]
        read_only_fields = ['id', 'created_at', 'is_verified']

    @extend_schema_field(serializers.DictField(allow_null=True))
    def get_organization(self, obj):
        if hasattr(obj, 'organization'):
            from organizations.serializers import OrganizationBriefSerializer
            return OrganizationBriefSerializer(obj.organization).data
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    # Optional profile fields during registration
    organization_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    donor_type = serializers.CharField(write_only=True, required=False, default='RESTAURANT')
    vehicle_type = serializers.CharField(write_only=True, required=False, default='BIKE')
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    latitude = serializers.FloatField(write_only=True, required=False, default=0.0)
    longitude = serializers.FloatField(write_only=True, required=False, default=0.0)

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
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        org_name = validated_data.pop('organization_name', '')
        donor_type = validated_data.pop('donor_type', 'RESTAURANT')
        vehicle_type = validated_data.pop('vehicle_type', 'BIKE')
        address = validated_data.pop('address', '')
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
                contact_person=user.get_full_name() or user.username
            )
        elif user.role == UserRole.VOLUNTEER:
            VolunteerProfile.objects.create(
                user=user,
                vehicle_type=vehicle_type,
                current_latitude=lat,
                current_longitude=lng
            )
        elif user.role == UserRole.NGO:
            from organizations.models import Organization
            Organization.objects.create(
                user=user,
                name=org_name or f"{user.first_name or user.username} Relief Org",
                contact_email=user.email,
                phone=user.phone_number or '',
                address=address,
                latitude=lat,
                longitude=lng
            )

        return user
