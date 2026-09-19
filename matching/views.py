from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, OpenApiResponse
from donations.models import FoodDonation
from organizations.models import Organization
from notifications.models import Notification, NotificationType
from .services import SmartMatchingEngine, VolunteerMatchingEngine


class MatchedNGOsView(APIView):
    """
    GET /api/matching/donations/{id}/ngos/
    Calculate smart priority match scores for all NGOs for the specified donation.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Matched NGOs for Donation",
        description="Priority Engine computes multi-factor score (Expiry + Distance + Capacity + Food Types) for NGOs.",
        responses={200: OpenApiResponse(description="Ranked list of NGOs.")}
    )
    def get(self, request, donation_id):
        try:
            donation = FoodDonation.objects.get(pk=donation_id)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        ranked_ngos = SmartMatchingEngine.rank_ngos_for_donation(donation)
        return Response({
            'donation_id': str(donation.id),
            'donation_title': donation.title,
            'quantity_kg': donation.quantity_kg,
            'hours_until_expiry': donation.hours_until_expiry,
            'total_matches_evaluated': len(ranked_ngos),
            'ranked_ngos': ranked_ngos
        }, status=status.HTTP_200_OK)


class MatchedVolunteersView(APIView):
    """
    GET /api/matching/donations/{id}/volunteers/
    Calculate volunteer proximity, vehicle suitability, and ratings for a pickup.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Get Matched Volunteers for Pickup",
        description="Volunteer Matching Engine evaluates proximity, vehicle capability, and experience rating.",
        responses={200: OpenApiResponse(description="Ranked list of volunteers.")}
    )
    def get(self, request, donation_id):
        try:
            donation = FoodDonation.objects.get(pk=donation_id)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        ranked_volunteers = VolunteerMatchingEngine.rank_volunteers_for_pickup(donation)
        return Response({
            'donation_id': str(donation.id),
            'pickup_location': donation.pickup_address,
            'quantity_kg': donation.quantity_kg,
            'ranked_volunteers': ranked_volunteers
        }, status=status.HTTP_200_OK)


class AutoMatchAlertView(APIView):
    """
    POST /api/matching/donations/{id}/auto-match/
    Executes matching engine and broadcasts urgent alert notifications to top 3 matched NGOs.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Trigger Auto-Match Alerts",
        description="Dispatches urgent priority push notifications to top-3 matched NGOs nearby.",
        request=None,
        responses={200: OpenApiResponse(description="Alert broadcast response.")}
    )
    def post(self, request, donation_id):
        try:
            donation = FoodDonation.objects.get(pk=donation_id)
        except FoodDonation.DoesNotExist:
            return Response({'error': 'Donation not found.'}, status=status.HTTP_404_NOT_FOUND)

        top_ngos = SmartMatchingEngine.rank_ngos_for_donation(donation, max_results=3)
        notified = []

        for match in top_ngos:
            try:
                org = Organization.objects.get(pk=match['organization_id'])
                Notification.objects.create(
                    recipient=org.user,
                    title='⚡ Urgent Surplus Food Match Nearby!',
                    message=(
                        f"Priority match score {match['scores']['total_score']}%: "
                        f"{donation.quantity_kg} kg of '{donation.title}' is available {match['distance_km']} km away. "
                        f"Expires in {donation.hours_until_expiry:.1f} hrs."
                    ),
                    notification_type=NotificationType.MATCH_FOUND,
                    related_donation_id=str(donation.id)
                )
                notified.append(org.name)
            except Organization.DoesNotExist:
                continue

        return Response({
            'message': f"Sent priority rescue alerts to {len(notified)} top-matched NGOs.",
            'notified_organizations': notified
        }, status=status.HTTP_200_OK)
