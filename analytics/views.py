from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from drf_spectacular.utils import extend_schema, OpenApiResponse
from django.db.models import Sum, Count
from accounts.models import User, UserRole, DonorProfile, VolunteerProfile
from organizations.models import Organization
from donations.models import FoodDonation, DonationStatus, FoodType


class PlatformAnalyticsDashboardView(APIView):
    """
    GET /api/analytics/dashboard/
    Global impact metrics: total kg rescued, meals provided, CO2 prevented, active members.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Get Platform Global Analytics",
        description="High-level ESG impact statistics: kg of food saved, meals provided, CO2 emissions prevented, food category breakdown.",
        responses={200: OpenApiResponse(description="Global platform metrics.")}
    )
    def get(self, request):
        total_donations = FoodDonation.objects.count()
        completed_donations = FoodDonation.objects.filter(status=DonationStatus.COMPLETED)
        
        rescued_kg = sum(d.quantity_kg for d in completed_donations)
        meals_provided = round(rescued_kg * 2.5)
        co2_prevented_kg = round(rescued_kg * 2.5, 1)

        active_donors = User.objects.filter(role=UserRole.DONOR).count()
        active_ngos = Organization.objects.count()
        active_volunteers = User.objects.filter(role=UserRole.VOLUNTEER).count()

        # Breakdown by food type
        type_breakdown = {}
        for ft in FoodType.values:
            count = FoodDonation.objects.filter(food_type=ft).count()
            if count > 0:
                type_breakdown[ft] = count

        return Response({
            'impact_metrics': {
                'total_food_saved_kg': round(rescued_kg, 1),
                'total_meals_served': meals_provided,
                'co2_emissions_prevented_kg': co2_prevented_kg,
                'total_donations_registered': total_donations,
                'total_rescues_completed': completed_donations.count(),
            },
            'community_network': {
                'active_donors': active_donors,
                'registered_ngos': active_ngos,
                'active_volunteers': active_volunteers,
            },
            'food_type_breakdown': type_breakdown,
        }, status=status.HTTP_200_OK)


class LeaderboardView(APIView):
    """
    GET /api/analytics/leaderboard/
    Top community champions: Top Donors, Top NGOs, Top Volunteers.
    """
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        summary="Community Leaderboards",
        description="Ranks top donors by kg rescued, top NGOs by meals served, and top volunteers by completed rescue missions.",
        responses={200: OpenApiResponse(description="Leaderboard rankings.")}
    )
    def get(self, request):
        top_donors_qs = DonorProfile.objects.all().order_by('-total_donations_kg')[:10]
        top_donors = [
            {
                'organization_name': d.organization_name or d.user.username,
                'donor_type': d.donor_type,
                'total_donations_count': d.total_donations_count,
                'total_donations_kg': round(d.total_donations_kg, 1),
                'meals_provided': round(d.total_donations_kg * 2.5),
            }
            for d in top_donors_qs
        ]

        top_ngos_qs = Organization.objects.all().order_by('-total_rescued_kg')[:10]
        top_ngos = [
            {
                'name': o.name,
                'is_verified': o.is_verified,
                'total_rescued_kg': round(o.total_rescued_kg, 1),
                'beneficiary_count': o.beneficiary_count,
                'pickups_completed': o.total_pickups_completed,
            }
            for o in top_ngos_qs
        ]

        top_volunteers_qs = VolunteerProfile.objects.all().order_by('-total_pickups_completed', '-rating')[:10]
        top_volunteers = [
            {
                'name': v.user.get_full_name() or v.user.username,
                'vehicle_type': v.vehicle_type,
                'rating': v.rating,
                'pickups_completed': v.total_pickups_completed,
            }
            for v in top_volunteers_qs
        ]

        return Response({
            'top_donors': top_donors,
            'top_ngos': top_ngos,
            'top_volunteers': top_volunteers,
        }, status=status.HTTP_200_OK)


class UserImpactView(APIView):
    """
    GET /api/analytics/my-impact/
    Personalized impact card for logged in user.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="My Personal Impact",
        description="Returns customized impact metrics for the authenticated user based on their specific role.",
        responses={200: OpenApiResponse(description="Personal impact card.")}
    )
    def get(self, request):
        user = request.user
        data = {'role': user.role, 'name': user.get_full_name() or user.username}

        if user.role == UserRole.DONOR and hasattr(user, 'donor_profile'):
            profile = user.donor_profile
            kg = profile.total_donations_kg
            data.update({
                'total_donations_count': profile.total_donations_count,
                'total_donations_kg': round(kg, 1),
                'meals_provided': round(kg * 2.5),
                'co2_prevented_kg': round(kg * 2.5, 1),
            })
        elif user.role == UserRole.NGO and hasattr(user, 'organization'):
            org = user.organization
            kg = org.total_rescued_kg
            data.update({
                'organization_name': org.name,
                'total_rescued_kg': round(kg, 1),
                'meals_distributed': round(kg * 2.5),
                'pickups_completed': org.total_pickups_completed,
                'beneficiaries_served': org.beneficiary_count,
            })
        elif user.role == UserRole.VOLUNTEER and hasattr(user, 'volunteer_profile'):
            v = user.volunteer_profile
            data.update({
                'pickups_completed': v.total_pickups_completed,
                'rating': v.rating,
                'vehicle_type': v.vehicle_type,
                'is_available': v.is_available,
            })

        return Response(data, status=status.HTTP_200_OK)


class AdminDashboardMetricsView(APIView):
    """
    GET /api/analytics/admin/
    Comprehensive metrics specifically for the Platform Administrator Dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Admin Platform Overview Metrics",
        description="Returns exhaustive administrative counts: Total, Active, Completed, and Expired Donations, Verified NGOs, Active Volunteers, Meals, and Pickups.",
        responses={200: OpenApiResponse(description="Admin summary.")}
    )
    def get(self, request):
        from pickups.models import PickupRequest, PickupAssignment, PickupAssignmentStatus

        total_donations = FoodDonation.objects.count()
        active_donations = FoodDonation.objects.filter(
            status__in=[
                DonationStatus.AVAILABLE,
                DonationStatus.REQUESTED,
                DonationStatus.APPROVED,
                DonationStatus.ASSIGNED,
                DonationStatus.PICKED_UP,
                DonationStatus.DELIVERED
            ]
        ).count()
        completed_donations = FoodDonation.objects.filter(status=DonationStatus.COMPLETED)
        completed_count = completed_donations.count()
        expired_donations = FoodDonation.objects.filter(status=DonationStatus.EXPIRED).count()

        verified_ngos = Organization.objects.filter(is_verified=True).count()
        pending_ngos = Organization.objects.filter(is_verified=False).count()
        total_ngos = Organization.objects.count()

        active_volunteers = VolunteerProfile.objects.filter(is_available=True).count()
        total_volunteers = VolunteerProfile.objects.count()

        food_saved_kg = sum(d.quantity_kg for d in completed_donations)
        meals_redistributed = round(food_saved_kg * 2.5)

        total_pickups = PickupAssignment.objects.count()
        successful_pickups = PickupAssignment.objects.filter(
            status=PickupAssignmentStatus.CONFIRMED_BY_NGO
        ).count()

        # Recent activities / audit items
        recent_donations = [
            {
                'id': str(d.id),
                'title': d.title,
                'donor': d.donor.get_full_name() or d.donor.username,
                'quantity_kg': d.quantity_kg,
                'status': d.status,
                'created_at': d.created_at.isoformat(),
            }
            for d in FoodDonation.objects.all().order_by('-created_at')[:8]
        ]

        pending_verifications = [
            {
                'id': str(org.id),
                'name': org.name,
                'registration_number': org.registration_number,
                'contact_email': org.contact_email,
                'phone': org.phone,
                'address': org.address,
                'capacity_kg': org.max_capacity_kg,
                'created_at': org.created_at.isoformat(),
            }
            for org in Organization.objects.filter(is_verified=False)[:10]
        ]

        return Response({
            'metrics': {
                'total_donations': total_donations,
                'active_donations': active_donations,
                'completed_donations': completed_count,
                'expired_donations': expired_donations,
                'verified_ngos': verified_ngos,
                'pending_ngos': pending_ngos,
                'total_ngos': total_ngos,
                'active_volunteers': active_volunteers,
                'total_volunteers': total_volunteers,
                'meals_redistributed': meals_redistributed,
                'food_saved_kg': round(food_saved_kg, 1),
                'total_pickups': total_pickups,
                'successful_pickups': successful_pickups,
            },
            'recent_donations': recent_donations,
            'pending_verifications': pending_verifications,
        }, status=status.HTTP_200_OK)

