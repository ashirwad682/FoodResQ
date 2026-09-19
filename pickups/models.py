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
    EN_ROUTE_PICKUP = 'EN_ROUTE_PICKUP', 'En Route to Donor'
    COLLECTED = 'COLLECTED', 'Food Collected from Donor'
    EN_ROUTE_DELIVERY = 'EN_ROUTE_DELIVERY', 'En Route to NGO'
    DELIVERED = 'DELIVERED', 'Delivered at NGO'
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
