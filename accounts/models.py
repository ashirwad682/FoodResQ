from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    DONOR = 'DONOR', 'Donor'
    NGO = 'NGO', 'NGO / Food Bank'
    VOLUNTEER = 'VOLUNTEER', 'Volunteer'
    ADMIN = 'ADMIN', 'Administrator'


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.DONOR,
        help_text='User role in the FoodResQ ecosystem'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_donor(self):
        return self.role == UserRole.DONOR

    def is_ngo(self):
        return self.role == UserRole.NGO

    def is_volunteer(self):
        return self.role == UserRole.VOLUNTEER

    def is_platform_admin(self):
        return self.role == UserRole.ADMIN or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.role})"


class DonorType(models.TextChoices):
    RESTAURANT = 'RESTAURANT', 'Restaurant'
    SUPERMARKET = 'SUPERMARKET', 'Supermarket / Grocery'
    HOTEL = 'HOTEL', 'Hotel / Resort'
    CATERER = 'CATERER', 'Event Caterer'
    CORPORATE = 'CORPORATE', 'Corporate Cafeteria'
    INDIVIDUAL = 'INDIVIDUAL', 'Individual / Community'
    OTHER = 'OTHER', 'Other'


class DonorProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='donor_profile'
    )
    organization_name = models.CharField(max_length=200, blank=True)
    donor_type = models.CharField(
        max_length=30,
        choices=DonorType.choices,
        default=DonorType.RESTAURANT
    )
    address = models.TextField(blank=True)
    latitude = models.FloatField(default=0.0)
    longitude = models.FloatField(default=0.0)
    fssai_license = models.CharField(max_length=50, blank=True)
    contact_person = models.CharField(max_length=100, blank=True)
    total_donations_count = models.PositiveIntegerField(default=0)
    total_donations_kg = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Donor: {self.organization_name or self.user.username}"


class VehicleType(models.TextChoices):
    BIKE = 'BIKE', 'Motorcycle / Bike'
    SCOOTER = 'SCOOTER', 'Scooter'
    CAR = 'CAR', 'Car'
    VAN = 'VAN', 'Van / Small Truck'
    WALK = 'WALK', 'On Foot / Bicycle'
    OTHER = 'OTHER', 'Other'


class VolunteerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='volunteer_profile'
    )
    vehicle_type = models.CharField(
        max_length=30,
        choices=VehicleType.choices,
        default=VehicleType.BIKE
    )
    vehicle_number = models.CharField(max_length=50, blank=True)
    max_distance_km = models.FloatField(default=15.0)
    address = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)
    rating = models.FloatField(default=5.0)
    total_pickups_completed = models.PositiveIntegerField(default=0)
    current_latitude = models.FloatField(default=0.0)
    current_longitude = models.FloatField(default=0.0)
    emergency_contact = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Volunteer: {self.user.get_full_name() or self.user.username}"
