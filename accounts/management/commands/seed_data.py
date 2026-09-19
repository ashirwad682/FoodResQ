import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User, UserRole, DonorProfile, VolunteerProfile, DonorType, VehicleType
from organizations.models import Organization
from donations.models import FoodDonation, FoodType, DonationStatus
from pickups.models import (
    PickupRequest,
    PickupAssignment,
    DonationStatusHistory,
    PickupRequestStatus,
    PickupAssignmentStatus,
)
from notifications.models import Notification, NotificationType


class Command(BaseCommand):
    help = 'Seeds initial sample data for FoodResQ demonstration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding FoodResQ demo data into MongoDB Atlas..."))

        # 1. Admin User
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@foodresq.org',
                'first_name': 'FoodResQ',
                'last_name': 'Administrator',
                'role': UserRole.ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
            }
        )
        admin_user.set_password('Admin@12345')
        admin_user.save()
        self.stdout.write(self.style.SUCCESS("✓ Admin created: admin / Admin@12345"))

        # 2. Donor: Spice Garden Restaurant
        donor1_user, _ = User.objects.get_or_create(
            username='donor_spice',
            defaults={
                'email': 'donor.spice@foodresq.org',
                'first_name': 'Vikram',
                'last_name': 'Mehta',
                'role': UserRole.DONOR,
                'phone_number': '+91 9876543210',
                'is_verified': True,
            }
        )
        donor1_user.set_password('Donor@12345')
        donor1_user.save()

        donor1_profile, _ = DonorProfile.objects.get_or_create(
            user=donor1_user,
            defaults={
                'organization_name': 'The Spice Garden Restaurant',
                'donor_type': DonorType.RESTAURANT,
                'address': 'Plot 45, Indiranagar 100ft Road, Bengaluru, Karnataka',
                'latitude': 12.9719,
                'longitude': 77.6412,
                'fssai_license': 'FSSAI-2122001928374',
                'contact_person': 'Vikram Mehta (Head Chef)',
                'total_donations_count': 12,
                'total_donations_kg': 285.0,
            }
        )

        # Donor 2: Fresh Bakes & Grocery
        donor2_user, _ = User.objects.get_or_create(
            username='donor_bake',
            defaults={
                'email': 'donor.bake@foodresq.org',
                'first_name': 'Sneha',
                'last_name': 'Patel',
                'role': UserRole.DONOR,
                'phone_number': '+91 9876501234',
                'is_verified': True,
            }
        )
        donor2_user.set_password('Donor@12345')
        donor2_user.save()

        donor2_profile, _ = DonorProfile.objects.get_or_create(
            user=donor2_user,
            defaults={
                'organization_name': 'Golden Crust Artisan Bakery',
                'donor_type': DonorType.CATERER,
                'address': 'Shop 12, Koramangala 5th Block, Bengaluru, Karnataka',
                'latitude': 12.9352,
                'longitude': 77.6245,
                'fssai_license': 'FSSAI-1122334455667',
                'contact_person': 'Sneha Patel',
                'total_donations_count': 8,
                'total_donations_kg': 140.0,
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Donors created: donor_spice, donor_bake / Donor@12345"))

        # 3. NGOs
        ngo1_user, _ = User.objects.get_or_create(
            username='ngo_feedhope',
            defaults={
                'email': 'ngo.feedhope@foodresq.org',
                'first_name': 'FeedHope',
                'last_name': 'Foundation',
                'role': UserRole.NGO,
                'phone_number': '+91 9123456780',
                'is_verified': True,
            }
        )
        ngo1_user.set_password('Ngo@12345')
        ngo1_user.save()

        ngo1_org, _ = Organization.objects.get_or_create(
            user=ngo1_user,
            defaults={
                'name': 'FeedHope Community Foundation',
                'registration_number': 'REG-KA-2018-00921',
                'contact_email': 'ngo.feedhope@foodresq.org',
                'phone': '+91 9123456780',
                'address': '18, Domlur Layout, Bengaluru, Karnataka',
                'latitude': 12.9610,
                'longitude': 77.6387,
                'is_verified': True,
                'max_capacity_kg': 350.0,
                'current_load_kg': 45.0,
                'beneficiary_count': 180,
                'total_rescued_kg': 620.0,
                'total_pickups_completed': 19,
            }
        )

        ngo2_user, _ = User.objects.get_or_create(
            username='ngo_citycare',
            defaults={
                'email': 'ngo.citycare@foodresq.org',
                'first_name': 'CityCare',
                'last_name': 'Shelter',
                'role': UserRole.NGO,
                'phone_number': '+91 9234567890',
                'is_verified': True,
            }
        )
        ngo2_user.set_password('Ngo@12345')
        ngo2_user.save()

        ngo2_org, _ = Organization.objects.get_or_create(
            user=ngo2_user,
            defaults={
                'name': 'CityCare Relief Shelter',
                'registration_number': 'REG-KA-2020-00445',
                'contact_email': 'ngo.citycare@foodresq.org',
                'phone': '+91 9234567890',
                'address': '55, Wilson Garden, Bengaluru, Karnataka',
                'latitude': 12.9482,
                'longitude': 77.5960,
                'is_verified': True,
                'max_capacity_kg': 200.0,
                'current_load_kg': 20.0,
                'beneficiary_count': 95,
                'total_rescued_kg': 310.0,
                'total_pickups_completed': 11,
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ NGOs created: ngo_feedhope, ngo_citycare / Ngo@12345"))

        # 4. Volunteers
        vol1_user, _ = User.objects.get_or_create(
            username='vol_arun',
            defaults={
                'email': 'vol.arun@foodresq.org',
                'first_name': 'Arun',
                'last_name': 'Kumar',
                'role': UserRole.VOLUNTEER,
                'phone_number': '+91 9345678901',
                'is_verified': True,
            }
        )
        vol1_user.set_password('Volunteer@12345')
        vol1_user.save()

        vol1_profile, _ = VolunteerProfile.objects.get_or_create(
            user=vol1_user,
            defaults={
                'vehicle_type': VehicleType.BIKE,
                'vehicle_number': 'KA-03-HA-4321',
                'max_distance_km': 15.0,
                'is_available': True,
                'rating': 4.9,
                'total_pickups_completed': 14,
                'current_latitude': 12.9700,
                'current_longitude': 77.6400,
            }
        )

        vol2_user, _ = User.objects.get_or_create(
            username='vol_priya',
            defaults={
                'email': 'vol.priya@foodresq.org',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': UserRole.VOLUNTEER,
                'phone_number': '+91 9456789012',
                'is_verified': True,
            }
        )
        vol2_user.set_password('Volunteer@12345')
        vol2_user.save()

        vol2_profile, _ = VolunteerProfile.objects.get_or_create(
            user=vol2_user,
            defaults={
                'vehicle_type': VehicleType.CAR,
                'vehicle_number': 'KA-01-MJ-8899',
                'max_distance_km': 25.0,
                'is_available': True,
                'rating': 5.0,
                'total_pickups_completed': 22,
                'current_latitude': 12.9500,
                'current_longitude': 77.6100,
            }
        )
        self.stdout.write(self.style.SUCCESS("✓ Volunteers created: vol_arun, vol_priya / Volunteer@12345"))

        # 5. Food Donations
        now = timezone.now()

        # Donation 1: AVAILABLE - Fresh Biryani & Curries
        donation1, _ = FoodDonation.objects.get_or_create(
            title='Surplus Lunch Buffet Biryani & Paneer Curry',
            donor=donor1_user,
            defaults={
                'description': 'Freshly prepared hyderabadi veg biryani and paneer butter masala from afternoon catering. Packed in food-grade thermal containers.',
                'food_type': FoodType.COOKED_MEAL,
                'quantity_kg': 28.5,
                'serves_count': 60,
                'prepared_time': now - timedelta(hours=2),
                'expiry_time': now + timedelta(hours=5),
                'pickup_address': donor1_profile.address,
                'latitude': donor1_profile.latitude,
                'longitude': donor1_profile.longitude,
                'special_instructions': 'Packed hot in insulated containers. Must be distributed within 5 hours.',
                'dietary_flags': ['VEG'],
                'status': DonationStatus.AVAILABLE,
            }
        )

        # Donation 2: AVAILABLE - Artisan Sourdough & Croissants
        donation2, _ = FoodDonation.objects.get_or_create(
            title='Artisan Sourdough Loaves & Breakfast Pastries',
            donor=donor2_user,
            defaults={
                'description': 'Overbaked surplus batch of whole-wheat sourdough loaves and fresh butter croissants.',
                'food_type': FoodType.BAKED_GOODS,
                'quantity_kg': 15.0,
                'serves_count': 45,
                'prepared_time': now - timedelta(hours=4),
                'expiry_time': now + timedelta(hours=18),
                'pickup_address': donor2_profile.address,
                'latitude': donor2_profile.latitude,
                'longitude': donor2_profile.longitude,
                'special_instructions': 'Packed in bakery crates. Ready for immediate handover at front desk.',
                'dietary_flags': ['VEG'],
                'status': DonationStatus.AVAILABLE,
            }
        )

        # Donation 3: COMPLETED - Evening Banquet Meal
        donation3, _ = FoodDonation.objects.get_or_create(
            title='Banquet Dinner Pulao & Dal Makhani',
            donor=donor1_user,
            defaults={
                'description': 'High quality banquet surplus successfully rescued and served yesterday.',
                'food_type': FoodType.COOKED_MEAL,
                'quantity_kg': 40.0,
                'serves_count': 85,
                'prepared_time': now - timedelta(days=1, hours=6),
                'expiry_time': now - timedelta(days=1),
                'pickup_address': donor1_profile.address,
                'latitude': donor1_profile.latitude,
                'longitude': donor1_profile.longitude,
                'special_instructions': 'Completed rescue.',
                'dietary_flags': ['VEG'],
                'status': DonationStatus.COMPLETED,
            }
        )

        # Record Status History & Assignment for completed donation
        req3, _ = PickupRequest.objects.get_or_create(
            donation=donation3,
            organization=ngo1_org,
            defaults={
                'requested_by': ngo1_user,
                'status': PickupRequestStatus.APPROVED,
                'requested_quantity_kg': 40.0,
            }
        )
        PickupAssignment.objects.get_or_create(
            pickup_request=req3,
            defaults={
                'volunteer': vol1_user,
                'status': PickupAssignmentStatus.CONFIRMED_BY_NGO,
                'collected_at': now - timedelta(days=1, hours=4),
                'delivered_at': now - timedelta(days=1, hours=3),
                'confirmed_at': now - timedelta(days=1, hours=2),
                'rating_by_ngo': 5.0,
            }
        )

        DonationStatusHistory.objects.get_or_create(
            donation=donation3,
            new_status=DonationStatus.COMPLETED,
            defaults={
                'old_status': DonationStatus.DELIVERED,
                'changed_by': ngo1_user,
                'notes': 'Rescue completed and verified by FeedHope Foundation.'
            }
        )

        # Notification for donor
        Notification.objects.get_or_create(
            recipient=donor1_user,
            title='Surplus Rescue Completed',
            defaults={
                'message': 'Your banquet donation fed 85 people at FeedHope Foundation. Thank you!',
                'notification_type': NotificationType.DELIVERY_COMPLETED,
                'is_read': True,
                'related_donation_id': str(donation3.id)
            }
        )

        self.stdout.write(self.style.SUCCESS("✓ Donations and completed rescue seeded."))
        self.stdout.write(self.style.SUCCESS("\n=============================================="))
        self.stdout.write(self.style.SUCCESS("FOODRESQ DATABASE SEEDING COMPLETED SUCCESS!"))
        self.stdout.write(self.style.SUCCESS("MongoDB Atlas is live and populated."))
        self.stdout.write(self.style.SUCCESS("==============================================\n"))
