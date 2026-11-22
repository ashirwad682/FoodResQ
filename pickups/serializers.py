from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from django.utils import timezone
from .models import (
    PickupRequest,
    PickupAssignment,
    DonationStatusHistory,
    DeliveryVerification,
    DeliveryEvidence,
    DeliveryAuditLog,
)
from donations.serializers import FoodDonationSerializer
from organizations.serializers import OrganizationBriefSerializer


class DeliveryEvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DeliveryEvidence
        fields = [
            'id',
            'assignment',
            'evidence_type',
            'photo_url',
            'uploaded_by',
            'uploaded_by_name',
            'uploaded_at',
            'location',
            'verification_status',
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_by_name', 'uploaded_at']

    @extend_schema_field(serializers.CharField())
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return 'System'


class DeliveryAuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DeliveryAuditLog
        fields = [
            'id',
            'assignment',
            'action',
            'performed_by',
            'performed_by_name',
            'performed_by_role',
            'timestamp',
            'metadata',
        ]
        read_only_fields = ['id', 'performed_by_name', 'timestamp']

    @extend_schema_field(serializers.CharField())
    def get_performed_by_name(self, obj):
        if obj.performed_by:
            return obj.performed_by.get_full_name() or obj.performed_by.username
        return 'System'


class DeliveryVerificationSerializer(serializers.ModelSerializer):
    donation_title = serializers.CharField(source='donation.title', read_only=True)
    donation_quantity = serializers.FloatField(source='donation.quantity_kg', read_only=True)
    donation_food_type = serializers.CharField(source='donation.food_type', read_only=True)
    pickup_address = serializers.CharField(source='donation.pickup_address', read_only=True)
    donor_name = serializers.SerializerMethodField(read_only=True)
    donor_phone = serializers.SerializerMethodField(read_only=True)
    ngo_name = serializers.CharField(source='ngo.name', read_only=True)
    volunteer_name = serializers.SerializerMethodField(read_only=True)
    volunteer_phone = serializers.SerializerMethodField(read_only=True)
    is_otp_expired = serializers.SerializerMethodField(read_only=True)
    remaining_seconds = serializers.SerializerMethodField(read_only=True)
    active_otp = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DeliveryVerification
        fields = [
            'id',
            'assignment',
            'donation',
            'donation_title',
            'donation_quantity',
            'donation_food_type',
            'pickup_address',
            'donor',
            'donor_name',
            'donor_phone',
            'ngo',
            'ngo_name',
            'volunteer',
            'volunteer_name',
            'volunteer_phone',
            'collection_photo_url',
            'collection_timestamp',
            'collection_location',
            'collection_confirmed',
            'handover_photo_url',
            'handover_timestamp',
            'handover_location',
            'otp_created_at',
            'otp_expires_at',
            'otp_verified_at',
            'otp_attempts',
            'is_otp_expired',
            'remaining_seconds',
            'active_otp',
            'verification_status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'otp_created_at',
            'otp_expires_at',
            'otp_verified_at',
            'otp_attempts',
            'is_otp_expired',
            'remaining_seconds',
            'active_otp',
            'created_at',
            'updated_at',
        ]

    @extend_schema_field(serializers.CharField())
    def get_donor_name(self, obj):
        return obj.donor.get_full_name() or obj.donor.username if obj.donor else ''

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_donor_phone(self, obj):
        return getattr(obj.donor, 'phone_number', '') if obj.donor else ''

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_volunteer_name(self, obj):
        return obj.volunteer.get_full_name() or obj.volunteer.username if obj.volunteer else None

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_volunteer_phone(self, obj):
        return getattr(obj.volunteer, 'phone_number', '') if obj.volunteer else None

    @extend_schema_field(serializers.BooleanField())
    def get_is_otp_expired(self, obj):
        if not obj.otp_expires_at:
            return True
        return timezone.now() > obj.otp_expires_at

    @extend_schema_field(serializers.IntegerField())
    def get_remaining_seconds(self, obj):
        if not obj.otp_expires_at:
            return 0
        rem = (obj.otp_expires_at - timezone.now()).total_seconds()
        return max(0, int(rem))

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_active_otp(self, obj):
        # SECURITY REQUIREMENT:
        # OTP must be visible only to the authorized NGO account.
        # Do not expose the OTP to the volunteer, donors, public API or logs.
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return None
        # Only the NGO assigned to this delivery can see the active OTP, and only while unexpired
        user = request.user
        is_assigned_ngo = (
            hasattr(user, 'organization') and user.organization == obj.ngo
        ) or (user == obj.ngo.user)
        if is_assigned_ngo and obj.otp_expires_at and timezone.now() <= obj.otp_expires_at:
            # Check cached or latest notification data for plain OTP if active
            from notifications.models import Notification, NotificationType
            notif = Notification.objects.filter(
                recipient=user,
                notification_type=NotificationType.OTP_GENERATED,
                related_assignment_id=str(obj.assignment_id)
            ).order_by('-created_at').first()
            if notif and notif.data and notif.data.get('otp'):
                return str(notif.data.get('otp'))
        return None


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
    donor_id = serializers.SerializerMethodField(read_only=True)
    donor_name = serializers.SerializerMethodField(read_only=True)
    donor_phone = serializers.SerializerMethodField(read_only=True)
    donor_email = serializers.SerializerMethodField(read_only=True)
    pickup_instructions = serializers.SerializerMethodField(read_only=True)
    verification = serializers.SerializerMethodField(read_only=True)

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
            'pickup_instructions',
            'organization_name',
            'donor_id',
            'donor_name',
            'donor_phone',
            'donor_email',
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
            'verification',
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
    def get_pickup_instructions(self, obj):
        return obj.pickup_request.donation.special_instructions or ''

    @extend_schema_field(serializers.CharField())
    def get_organization_name(self, obj):
        return obj.pickup_request.organization.name

    @extend_schema_field(serializers.CharField())
    def get_donor_id(self, obj):
        donor = obj.pickup_request.donation.donor
        return str(donor.id) if donor else ''

    @extend_schema_field(serializers.CharField())
    def get_donor_name(self, obj):
        donor = obj.pickup_request.donation.donor
        return (donor.get_full_name() or donor.username) if donor else 'Donor'

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_donor_phone(self, obj):
        donor = obj.pickup_request.donation.donor
        return getattr(donor, 'phone_number', '') if donor else ''

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_donor_email(self, obj):
        donor = obj.pickup_request.donation.donor
        return getattr(donor, 'email', '') if donor else ''

    @extend_schema_field(serializers.DictField(allow_null=True))
    def get_verification(self, obj):
        if hasattr(obj, 'verification'):
            return DeliveryVerificationSerializer(obj.verification, context=self.context).data
        return None

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
        if value.status not in ['AVAILABLE', 'REQUESTED']:
            raise serializers.ValidationError(
                f"Donation is no longer available. Current status: '{value.status}'. This food batch has already been reserved or completed."
            )
        if value.is_expired:
            raise serializers.ValidationError("Donation has already expired.")
        return value
