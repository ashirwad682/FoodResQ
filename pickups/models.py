from django.db import models
from django.conf import settings
from donations.models import FoodDonation
from organizations.models import Organization


class PickupRequestStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Donor Approval'
    APPROVED = 'APPROVED', 'Approved by Donor'
    REJECTED = 'REJECTED', 'Rejected by Donor'
    CANCELLED = 'CANCELLED', 'Cancelled by NGO'


class PickupAssignmentStatus(models.TextChoices):
    PENDING_VOLUNTEER = 'PENDING_VOLUNTEER', 'Awaiting Volunteer Acceptance'
    ASSIGNED = 'ASSIGNED', 'Volunteer Assigned'
    ARRIVED_AT_DONOR = 'ARRIVED_AT_DONOR', 'Arrived at Donor'
    COLLECTION_EVIDENCE_SUBMITTED = 'COLLECTION_EVIDENCE_SUBMITTED', 'Collection Evidence Submitted'
    PICKED_UP = 'PICKED_UP', 'Picked Up'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    ARRIVED_AT_NGO = 'ARRIVED_AT_NGO', 'Arrived at NGO'
    HANDOVER_EVIDENCE_SUBMITTED = 'HANDOVER_EVIDENCE_SUBMITTED', 'Handover Evidence Submitted'
    OTP_VERIFIED = 'OTP_VERIFIED', 'OTP Verified'
    DELIVERED = 'DELIVERED', 'Delivered'
    # Legacy / alias choices
    EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP', 'En Route to Donor'
    COLLECTED = 'COLLECTED', 'Food Collected from Donor'
    EN_ROUTE_DELIVERY = 'EN_ROUTE_DELIVERY', 'En Route to NGO'
    CONFIRMED_BY_NGO = 'CONFIRMED_BY_NGO', 'Confirmed & Completed by NGO'


class PickupRequest(models.Model):
    donation = models.ForeignKey(
        FoodDonation,
        on_delete=models.CASCADE,
        related_name='pickup_requests'
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='pickup_requests'
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='initiated_pickup_requests'
    )
    status = models.CharField(
        max_length=30,
        choices=PickupRequestStatus.choices,
        default=PickupRequestStatus.PENDING
    )
    requested_quantity_kg = models.FloatField(
        null=True,
        blank=True,
        help_text='Kg requested (default: full donation quantity)'
    )
    notes = models.TextField(blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request by {self.organization.name} for {self.donation.title} [{self.status}]"


class PickupAssignment(models.Model):
    pickup_request = models.OneToOneField(
        PickupRequest,
        on_delete=models.CASCADE,
        related_name='assignment'
    )
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_assignments'
    )
    status = models.CharField(
        max_length=30,
        choices=PickupAssignmentStatus.choices,
        default=PickupAssignmentStatus.PENDING_VOLUNTEER
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    collected_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    proof_image_url = models.URLField(max_length=500, blank=True, null=True)
    delivery_notes = models.TextField(blank=True)
    rating_by_ngo = models.FloatField(null=True, blank=True)

    def __str__(self):
        v_name = self.volunteer.username if self.volunteer else 'Unassigned'
        return f"Assignment for Req #{self.pickup_request.id} -> {v_name} [{self.status}]"


class DonationStatusHistory(models.Model):
    donation = models.ForeignKey(
        FoodDonation,
        on_delete=models.CASCADE,
        related_name='status_history'
    )
    old_status = models.CharField(max_length=50, blank=True)
    new_status = models.CharField(max_length=50)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes_logged'
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.donation.title}: {self.old_status} -> {self.new_status} at {self.timestamp}"


class VerificationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Pickup'
    ARRIVED_DONOR = 'ARRIVED_DONOR', 'Arrived at Donor'
    COLLECTION_SUBMITTED = 'COLLECTION_SUBMITTED', 'Collection Evidence Submitted'
    PICKED_UP = 'PICKED_UP', 'Food Picked Up'
    IN_TRANSIT = 'IN_TRANSIT', 'In Transit'
    ARRIVED_NGO = 'ARRIVED_NGO', 'Arrived at NGO'
    HANDOVER_SUBMITTED = 'HANDOVER_SUBMITTED', 'Handover Evidence Submitted'
    OTP_SENT = 'OTP_SENT', 'Handover OTP Sent'
    OTP_VERIFIED = 'OTP_VERIFIED', 'OTP Verified'
    DELIVERED = 'DELIVERED', 'Delivered & Completed'
    FAILED = 'FAILED', 'Verification Disputed or Failed'


class DeliveryVerification(models.Model):
    assignment = models.OneToOneField(
        PickupAssignment,
        on_delete=models.CASCADE,
        related_name='verification'
    )
    donation = models.ForeignKey(
        FoodDonation,
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donor_verifications'
    )
    ngo = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='ngo_verifications'
    )
    volunteer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='volunteer_verifications'
    )

    # Stage One: Collection from Donor
    collection_photo_url = models.TextField(blank=True, default='')
    collection_timestamp = models.DateTimeField(null=True, blank=True)
    collection_location = models.JSONField(default=dict, blank=True)
    collection_confirmed = models.BooleanField(default=False)

    # Stage Two & Three: Handover at NGO
    handover_photo_url = models.TextField(blank=True, default='')
    handover_timestamp = models.DateTimeField(null=True, blank=True)
    handover_location = models.JSONField(default=dict, blank=True)

    # Stage Four: Cryptographic 6-digit OTP verification
    otp_hash = models.CharField(max_length=256, blank=True, default='')
    otp_created_at = models.DateTimeField(null=True, blank=True)
    otp_expires_at = models.DateTimeField(null=True, blank=True)
    otp_verified_at = models.DateTimeField(null=True, blank=True)
    otp_attempts = models.IntegerField(default=0)
    max_otp_attempts = models.IntegerField(default=5)

    verified_by_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_deliveries'
    )
    verification_status = models.CharField(
        max_length=40,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def generate_otp(self, expiry_seconds=60):
        """Generates a secure 6-digit OTP valid for exactly expiry_seconds (60s)."""
        import secrets
        import hashlib
        from django.utils import timezone
        plain_otp = f"{secrets.randbelow(900000) + 100000}"
        salt = str(self.assignment_id)
        self.otp_hash = hashlib.sha256(f"{plain_otp}:{salt}".encode()).hexdigest()
        now = timezone.now()
        self.otp_created_at = now
        self.otp_expires_at = now + timezone.timedelta(seconds=expiry_seconds)
        self.otp_attempts = 0
        self.verification_status = VerificationStatus.OTP_SENT
        self.save()
        return plain_otp

    def verify_otp(self, plain_otp, verified_by):
        """Validates the 6-digit OTP against hash with server-side 60s expiration and rate limiting."""
        import hashlib
        from django.utils import timezone
        if not self.otp_hash or not self.otp_expires_at:
            return False, "No active OTP generated for this delivery."
        if timezone.now() > self.otp_expires_at:
            return False, "OTP has expired. 60-second validity window elapsed. Please resend a new OTP."
        if self.otp_attempts >= self.max_otp_attempts:
            return False, "Maximum verification attempts exceeded. Please resend a new OTP."
        
        salt = str(self.assignment_id)
        expected = hashlib.sha256(f"{str(plain_otp).strip()}:{salt}".encode()).hexdigest()
        if expected != self.otp_hash:
            self.otp_attempts += 1
            self.save(update_fields=['otp_attempts', 'updated_at'])
            remaining = max(0, self.max_otp_attempts - self.otp_attempts)
            return False, f"Incorrect OTP entered. {remaining} attempt(s) remaining."

        # Successfully verified
        now = timezone.now()
        self.otp_verified_at = now
        self.verified_by_user = verified_by
        self.verification_status = VerificationStatus.OTP_VERIFIED
        self.save()
        return True, "OTP verified successfully."

    def __str__(self):
        return f"Verification #{self.id} for Assignment #{self.assignment_id} [{self.verification_status}]"


class DeliveryEvidence(models.Model):
    assignment = models.ForeignKey(
        PickupAssignment,
        on_delete=models.CASCADE,
        related_name='evidence_records'
    )
    evidence_type = models.CharField(
        max_length=20,
        choices=[('COLLECTION', 'Collection Photo'), ('HANDOVER', 'Handover Photo')]
    )
    photo_url = models.TextField()
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='uploaded_evidence'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    location = models.JSONField(default=dict, blank=True)
    verification_status = models.CharField(max_length=30, default='VALID')

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.evidence_type} Evidence for Assignment #{self.assignment_id}"


class DeliveryAuditLog(models.Model):
    assignment = models.ForeignKey(
        PickupAssignment,
        on_delete=models.CASCADE,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=100)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_audit_entries'
    )
    performed_by_role = models.CharField(max_length=50, blank=True, default='')
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.action} by {self.performed_by or 'System'}"
