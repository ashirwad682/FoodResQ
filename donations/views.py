from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import FoodDonation, DonationStatus
from .serializers import FoodDonationSerializer
from accounts.permissions import IsDonor, IsOwnerOrAdmin
from accounts.models import UserRole


class FoodDonationListCreateView(generics.ListCreateAPIView):
    """
    GET /api/donations/
    List food donations. Filter by ?status=AVAILABLE, ?food_type=COOKED_MEAL, ?my_donations=true
    
    POST /api/donations/
    Create a new food donation (DONOR role only). Validates expiry, quantity, location, food type.
    """
    serializer_class = FoodDonationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsDonor()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = FoodDonation.objects.all().order_by('-created_at')
        user = self.request.user

        # Auto-expire donations whose expiry has passed and are still AVAILABLE
        now = timezone.now()
        FoodDonation.objects.filter(
            status=DonationStatus.AVAILABLE,
            expiry_time__lt=now
        ).update(status=DonationStatus.EXPIRED)

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        food_type_param = self.request.query_params.get('food_type')
        if food_type_param:
            queryset = queryset.filter(food_type=food_type_param.upper())

        my_donations = self.request.query_params.get('my_donations')
        if my_donations and my_donations.lower() in ['true', '1']:
            if not user.is_authenticated:
                return FoodDonation.objects.none()
            queryset = queryset.filter(donor=user)

        return queryset

    def perform_create(self, serializer):
        donation = serializer.save(donor=self.request.user)

        # Update donor statistics
        if hasattr(self.request.user, 'donor_profile'):
            profile = self.request.user.donor_profile
            profile.total_donations_count += 1
            profile.total_donations_kg += donation.quantity_kg
            profile.save()

        # Log initial status history
        from pickups.models import (
            DonationStatusHistory,
            PickupRequest,
            PickupAssignment,
            PickupRequestStatus,
            PickupAssignmentStatus,
        )
        from organizations.models import Organization
        from notifications.models import Notification, NotificationType
        from accounts.models import VolunteerProfile
        from matching.services import SmartMatchingEngine

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status='',
            new_status=DonationStatus.AVAILABLE,
            changed_by=self.request.user,
            notes='Food donation posted and verified on FoodResQ platform.'
        )

        # Auto-match with closest/highest-priority verified NGO and create ready-to-dispatch pickup assignment
        top_ngos = SmartMatchingEngine.rank_ngos_for_donation(donation, max_results=1)
        target_org = None
        if top_ngos:
            try:
                target_org = Organization.objects.get(pk=top_ngos[0]['organization_id'])
            except Organization.DoesNotExist:
                pass
        if not target_org:
            target_org = Organization.objects.filter(is_verified=True).first() or Organization.objects.first()

        if target_org:
            pickup_req, _ = PickupRequest.objects.get_or_create(
                donation=donation,
                organization=target_org,
                defaults={
                    'requested_by': target_org.user,
                    'requested_quantity_kg': donation.quantity_kg,
                    'status': PickupRequestStatus.APPROVED,
                    'notes': f'Auto-matched for immediate community rescue by {target_org.name}.'
                }
            )
            PickupAssignment.objects.get_or_create(
                pickup_request=pickup_req,
                defaults={
                    'status': PickupAssignmentStatus.PENDING_VOLUNTEER,
                    'volunteer': None
                }
            )
            # Keep donation status AVAILABLE for NGO discovery and requests,
            # while the pickup assignment is ready in PENDING_VOLUNTEER for volunteers
            donation.status = DonationStatus.AVAILABLE
            donation.save()

            DonationStatusHistory.objects.create(
                donation=donation,
                old_status='',
                new_status=DonationStatus.AVAILABLE,
                changed_by=self.request.user,
                notes=f"Auto-matched with {target_org.name}. Ready for volunteer pickup or direct NGO request."
            )

        # Broadcast notifications to verified NGOs and active volunteers
        verified_ngos = Organization.objects.filter(is_verified=True)
        for ngo in verified_ngos:
            Notification.objects.create(
                recipient=ngo.user,
                title='New Surplus Food Alert',
                message=f"New surplus batch '{donation.title}' ({donation.quantity_kg} kg) posted nearby.",
                notification_type=NotificationType.NEW_DONATION,
                related_donation_id=str(donation.id)
            )

        available_volunteers = VolunteerProfile.objects.filter(is_available=True)
        for vol in available_volunteers:
            Notification.objects.create(
                recipient=vol.user,
                title='New Rescue Mission Available',
                message=f"Pickup for '{donation.title}' ({donation.quantity_kg} kg) is ready to claim.",
                notification_type=NotificationType.PICKUP_ASSIGNED,
                related_donation_id=str(donation.id)
            )


class FoodDonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/donations/{id}/
    PATCH /api/donations/{id}/ (Owner donor only, only when AVAILABLE)
    DELETE /api/donations/{id}/ (Owner donor only, only when AVAILABLE)
    """
    queryset = FoodDonation.objects.all()
    serializer_class = FoodDonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.donor != request.user and not (request.user.is_staff or request.user.role == UserRole.ADMIN):
                self.permission_denied(
                    request, message="Only the donor who posted this donation can edit or delete it."
                )
            if obj.status != DonationStatus.AVAILABLE:
                self.permission_denied(
                    request, message=f"Cannot edit or delete donation once in status '{obj.status}'."
                )
