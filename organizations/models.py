from django.db import models
from django.conf import settings


def default_accepted_food_types():
    return [
        'COOKED_MEAL',
        'RAW_INGREDIENTS',
        'BAKED_GOODS',
        'PACKAGED_FOOD',
        'DAIRY',
        'FRUITS_VEGETABLES'
    ]


class Organization(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organization'
    )
    name = models.CharField(max_length=200)
    registration_number = models.CharField(max_length=100, blank=True)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    is_verified = models.BooleanField(default=False)
    max_capacity_kg = models.FloatField(default=200.0)
    current_load_kg = models.FloatField(default=0.0)
    accepted_food_types = models.JSONField(default=default_accepted_food_types)
    operating_hours_start = models.TimeField(default="08:00:00")
    operating_hours_end = models.TimeField(default="22:00:00")
    beneficiary_count = models.PositiveIntegerField(default=50)
    total_rescued_kg = models.FloatField(default=0.0)
    total_pickups_completed = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_capacity_kg(self):
        return max(0.0, self.max_capacity_kg - self.current_load_kg)

    def __str__(self):
        return self.name
