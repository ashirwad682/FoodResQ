from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    NEW_DONATION = 'NEW_DONATION', 'New Surplus Food Posted'
    MATCH_FOUND = 'MATCH_FOUND', 'Match Found'
    REQUEST_RECEIVED = 'REQUEST_RECEIVED', 'Rescue Request Received'
    REQUEST_APPROVED = 'REQUEST_APPROVED', 'Rescue Request Approved'
    REQUEST_REJECTED = 'REQUEST_REJECTED', 'Rescue Request Rejected'
    PICKUP_ASSIGNED = 'PICKUP_ASSIGNED', 'Volunteer Assigned'
    PICKUP_IN_TRANSIT = 'PICKUP_IN_TRANSIT', 'Pickup In Transit'
    DELIVERY_COMPLETED = 'DELIVERY_COMPLETED', 'Delivery Completed'
    SYSTEM = 'SYSTEM', 'System Alert'


class Notification(models.Model):
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=40,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    is_read = models.BooleanField(default=False)
    related_donation_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To: {self.recipient.username} - {self.title} [{'Read' if self.is_read else 'Unread'}]"
