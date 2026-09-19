from django.db import models
from django.conf import settings
from django.utils import timezone


class FoodType(models.TextChoices):
    COOKED_MEAL = 'COOKED_MEAL', 'Cooked Meal / Prepared Food'
    RAW_INGREDIENTS = 'RAW_INGREDIENTS', 'Raw Ingredients / Grains'
    BAKED_GOODS = 'BAKED_GOODS', 'Baked Goods / Bread'
    PACKAGED_FOOD = 'PACKAGED_FOOD', 'Packaged / Canned Food'
    DAIRY = 'DAIRY', 'Dairy Products'
    FRUITS_VEGETABLES = 'FRUITS_VEGETABLES', 'Fresh Produce / Fruits & Vegetables'


class DonationStatus(models.TextChoices):
    AVAILABLE = 'AVAILABLE', 'Available for Rescue'
    REQUESTED = 'REQUESTED', 'Requested by NGO'
    APPROVED = 'APPROVED', 'Approved by Donor'
    ASSIGNED = 'ASSIGNED', 'Volunteer Assigned'
    PICKED_UP = 'PICKED_UP', 'Picked Up'
    DELIVERED = 'DELIVERED', 'Delivered to NGO'
    COMPLETED = 'COMPLETED', 'Completed & Verified'
    CANCELLED = 'CANCELLED', 'Cancelled'
    EXPIRED = 'EXPIRED', 'Expired'


def default_dietary_flags():
    return ['VEG']


class FoodDonation(models.Model):
    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donations'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    food_type = models.CharField(
        max_length=30,
        choices=FoodType.choices,
        default=FoodType.COOKED_MEAL
    )
    quantity_kg = models.FloatField(
        help_text='Quantity of surplus food in kilograms (must be > 0)'
    )
    serves_count = models.PositiveIntegerField(
        default=10,
        help_text='Estimated number of people this food can feed'
    )
    prepared_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text='When food was prepared / packed'
    )
    expiry_time = models.DateTimeField(
        help_text='Estimated consumption expiry time (must be in the future)'
    )
    pickup_address = models.TextField()
    latitude = models.FloatField(
        help_text='Latitude coordinate between -90 and 90'
    )
    longitude = models.FloatField(
        help_text='Longitude coordinate between -180 and 180'
    )
    special_instructions = models.TextField(
        blank=True,
        help_text='Storage, temperature or handling instructions (e.g., keep refrigerated)'
    )
    dietary_flags = models.JSONField(
        default=default_dietary_flags,
        help_text='List of flags such as VEG, NON_VEG, VEGAN, HALAL, GLUTEN_FREE'
    )
    status = models.CharField(
        max_length=30,
        choices=DonationStatus.choices,
        default=DonationStatus.AVAILABLE
    )
    image_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text='Optional URL/photo of the food batch'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_expired(self):
        return timezone.now() > self.expiry_time

    @property
    def hours_until_expiry(self):
        diff = self.expiry_time - timezone.now()
        return max(0.0, diff.total_seconds() / 3600.0)

    def __str__(self):
        return f"{self.title} ({self.quantity_kg}kg) - {self.status}"
