from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from .models import PickupRequest, PickupAssignment, DonationStatusHistory
from donations.serializers import FoodDonationSerializer
from organizations.serializers import OrganizationBriefSerializer


class DonationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DonationStatusHistory
        fields = [
            'id',
            'donation',
            'old_status',
            'new_status',
            'changed_by',
            'changed_by_name',
            'notes',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']

    @extend_schema_field(serializers.CharField())
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return obj.changed_by.get_full_name() or obj.changed_by.username
        return 'System'


class PickupAssignmentSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.SerializerMethodField(read_only=True)
    volunteer_phone = serializers.SerializerMethodField(read_only=True)
    volunteer_vehicle = serializers.SerializerMethodField(read_only=True)
    donation = serializers.SerializerMethodField(read_only=True)
    donation_title = serializers.SerializerMethodField(read_only=True)
    donation_quantity = serializers.SerializerMethodField(read_only=True)
    donation_food_type = serializers.SerializerMethodField(read_only=True)
    pickup_address = serializers.SerializerMethodField(read_only=True)
    organization_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PickupAssignment
        fields = [
            'id',
            'pickup_request',
            'donation',
            'donation_title',
            'donation_quantity',
            'donation_food_type',
            'pickup_address',
            'organization_name',
            'volunteer',
            'volunteer_name',
            'volunteer_phone',
            'volunteer_vehicle',
            'status',
            'assigned_at',
            'collected_at',
            'delivered_at',
            'confirmed_at',
            'proof_image_url',
            'delivery_notes',
            'rating_by_ngo',
        ]
        read_only_fields = ['id', 'assigned_at', 'collected_at', 'delivered_at', 'confirmed_at']

    @extend_schema_field(serializers.CharField())
    def get_donation(self, obj):
        return str(obj.pickup_request.donation.id)

    @extend_schema_field(serializers.CharField())
    def get_donation_title(self, obj):
        return obj.pickup_request.donation.title

    @extend_schema_field(serializers.FloatField())
    def get_donation_quantity(self, obj):
        return obj.pickup_request.requested_quantity_kg or obj.pickup_request.donation.quantity_kg

    @extend_schema_field(serializers.CharField())
    def get_donation_food_type(self, obj):
        return obj.pickup_request.donation.food_type

    @extend_schema_field(serializers.CharField())
    def get_pickup_address(self, obj):
        return obj.pickup_request.donation.pickup_address

    @extend_schema_field(serializers.CharField())
    def get_organization_name(self, obj):
        return obj.pickup_request.organization.name

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_volunteer_name(self, obj):
        if obj.volunteer:
            return obj.volunteer.get_full_name() or obj.volunteer.username
        return None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_volunteer_phone(self, obj):
        return obj.volunteer.phone_number if obj.volunteer else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_volunteer_vehicle(self, obj):
        if obj.volunteer and hasattr(obj.volunteer, 'volunteer_profile'):
            return obj.volunteer.volunteer_profile.vehicle_type
        return None


class PickupRequestSerializer(serializers.ModelSerializer):
    donation_details = FoodDonationSerializer(source='donation', read_only=True)
    organization_details = OrganizationBriefSerializer(source='organization', read_only=True)
    assignment = PickupAssignmentSerializer(read_only=True)

    class Meta:
        model = PickupRequest
        fields = [
            'id',
            'donation',
            'donation_details',
            'organization',
            'organization_details',
            'requested_by',
            'status',
            'requested_quantity_kg',
            'notes',
            'assignment',
            'requested_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'requested_by', 'status', 'requested_at', 'updated_at']


class CreatePickupRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupRequest
        fields = ['donation', 'requested_quantity_kg', 'notes']

    def validate_donation(self, value):
        if value.status != 'AVAILABLE':
            raise serializers.ValidationError(
                f"Donation is not available for request. Current status: '{value.status}'."
            )
        if value.is_expired:
            raise serializers.ValidationError("Donation has already expired.")
        return value
