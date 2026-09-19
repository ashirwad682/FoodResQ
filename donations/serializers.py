from rest_framework import serializers
from django.utils import timezone
from .models import FoodDonation, FoodType, DonationStatus
from accounts.serializers import UserSerializer


from drf_spectacular.utils import extend_schema_field


class FoodDonationSerializer(serializers.ModelSerializer):
    donor_details = serializers.SerializerMethodField(read_only=True)
    hours_until_expiry = serializers.FloatField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    priority = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = FoodDonation
        fields = [
            'id',
            'donor',
            'donor_details',
            'title',
            'description',
            'food_type',
            'quantity_kg',
            'serves_count',
            'prepared_time',
            'expiry_time',
            'hours_until_expiry',
            'is_expired',
            'priority',
            'pickup_address',
            'latitude',
            'longitude',
            'special_instructions',
            'dietary_flags',
            'status',
            'image_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'donor', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        # Support aliases pickup_latitude, pickup_longitude, servings
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'latitude' not in data and 'pickup_latitude' in data:
            data['latitude'] = data['pickup_latitude']
        if 'longitude' not in data and 'pickup_longitude' in data:
            data['longitude'] = data['pickup_longitude']
        if 'serves_count' not in data and 'servings' in data:
            data['serves_count'] = data['servings']

        # Ensure valid latitude and longitude ranges
        try:
            lat = float(data.get('latitude', 12.9716))
            if lat < -90.0 or lat > 90.0:
                data['latitude'] = 12.9716
            else:
                data['latitude'] = lat
        except (ValueError, TypeError):
            data['latitude'] = 12.9716

        try:
            lng = float(data.get('longitude', 77.5946))
            if lng < -180.0 or lng > 180.0:
                data['longitude'] = 77.5946
            else:
                data['longitude'] = lng
        except (ValueError, TypeError):
            data['longitude'] = 77.5946

        return super().to_internal_value(data)

    @extend_schema_field(serializers.DictField())
    def get_priority(self, obj):
        from matching.services import PriorityEngine
        try:
            return PriorityEngine.calculate_priority(obj)
        except Exception:
            return {
                'priority_score': 50.0,
                'priority_level': 'MEDIUM',
                'hours_remaining': obj.hours_until_expiry,
                'quantity_kg': obj.quantity_kg,
            }

    @extend_schema_field(serializers.DictField())
    def get_donor_details(self, obj):
        donor = obj.donor
        org_name = getattr(donor.donor_profile, 'organization_name', '') if hasattr(donor, 'donor_profile') else ''
        return {
            'id': str(donor.id),
            'name': donor.get_full_name() or donor.username,
            'organization_name': org_name,
            'phone': donor.phone_number,
        }

    def validate_quantity_kg(self, value):
        """Backend validation for food quantity."""
        if value is None or value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0 kg.")
        if value > 5000:
            raise serializers.ValidationError("Quantity exceeds maximum single-batch limit of 5000 kg.")
        return round(float(value), 2)

    def validate_serves_count(self, value):
        if value <= 0:
            raise serializers.ValidationError("Serves count must be at least 1 person.")
        return value

    def validate_expiry_time(self, value):
        """Backend validation for expiry time (must be in future)."""
        now = timezone.now()
        if value <= now:
            raise serializers.ValidationError(
                f"Expiry time must be in the future. Received {value.isoformat()}, current time is {now.isoformat()}."
            )
        # Check that it is at least 30 minutes in the future
        if (value - now).total_seconds() < 1800:
            raise serializers.ValidationError(
                "Food expiry must be at least 30 minutes ahead to allow rescue and pickup logistics."
            )
        return value

    def validate_latitude(self, value):
        if value < -90.0 or value > 90.0:
            raise serializers.ValidationError("Latitude must be between -90.0 and 90.0.")
        return value

    def validate_longitude(self, value):
        if value < -180.0 or value > 180.0:
            raise serializers.ValidationError("Longitude must be between -180.0 and 180.0.")
        return value

    def validate_food_type(self, value):
        valid_types = [c[0] for c in FoodType.choices]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid food type '{value}'. Allowed: {valid_types}")
        return value

    def validate(self, attrs):
        # If updating an existing donation, ensure it's still AVAILABLE
        if self.instance and self.instance.status != DonationStatus.AVAILABLE:
            # Allow status changes if handled via pickup flow, but block editing payload
            changing_fields = [k for k in attrs.keys() if k != 'status']
            if changing_fields:
                raise serializers.ValidationError(
                    f"Donation cannot be modified because its current status is '{self.instance.status}'."
                )
        return attrs
