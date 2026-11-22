from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from accounts.models import VolunteerProfile, UserRole
from accounts.serializers import VolunteerProfileSerializer
from accounts.permissions import IsVolunteer, IsAdminUser
from pickups.models import PickupAssignment, PickupAssignmentStatus
from pickups.serializers import PickupAssignmentSerializer


class VolunteerListView(generics.ListAPIView):
    """
    GET /api/volunteers/
    List active/available volunteers. Filter by ?available=true.
    """
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = VolunteerProfile.objects.all().order_by('-total_pickups_completed')
        avail = self.request.query_params.get('available')
        if avail is not None:
            queryset = queryset.filter(is_available=avail.lower() in ['true', '1'])
        return queryset


class VolunteerStatusUpdateView(APIView):
    """
    PATCH /api/volunteers/status/
    Volunteer updates availability, live location coordinates.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    @extend_schema(
        summary="Get Volunteer Live Status",
        description="Volunteer retrieves current availability status and profile telemetry.",
        responses={200: VolunteerProfileSerializer}
    )
    def get(self, request):
        user = request.user
        if not hasattr(user, 'volunteer_profile'):
            return Response({'error': 'Volunteer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(VolunteerProfileSerializer(user.volunteer_profile).data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Update Volunteer Live Status",
        description="Volunteer toggles availability, updates GPS coordinates, or adjusts max rescue distance.",
        request=VolunteerProfileSerializer,
        responses={200: VolunteerProfileSerializer}
    )
    def patch(self, request):
        user = request.user
        if not hasattr(user, 'volunteer_profile'):
            return Response({'error': 'Volunteer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile = user.volunteer_profile
        data = request.data

        if 'is_available' in data:
            profile.is_available = bool(data['is_available'])
        if 'latitude' in data:
            profile.current_latitude = float(data['latitude'])
        if 'longitude' in data:
            profile.current_longitude = float(data['longitude'])
        if 'max_distance_km' in data:
            profile.max_distance_km = float(data['max_distance_km'])

        profile.save()
        return Response(VolunteerProfileSerializer(profile).data, status=status.HTTP_200_OK)


class VolunteerActiveAssignmentView(APIView):
    """
    GET /api/volunteers/active-assignment/
    Get current active rescue mission for logged-in volunteer.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    @extend_schema(
        summary="Get Active Volunteer Mission",
        description="Returns currently in-flight rescue mission assigned to this volunteer.",
        responses={200: OpenApiResponse(description="Active mission details or null.")}
    )
    def get(self, request):
        user = request.user
        active_statuses = [
            PickupAssignmentStatus.ASSIGNED,
            PickupAssignmentStatus.ARRIVED_AT_DONOR,
            PickupAssignmentStatus.COLLECTION_EVIDENCE_SUBMITTED,
            PickupAssignmentStatus.PICKED_UP,
            PickupAssignmentStatus.IN_TRANSIT,
            PickupAssignmentStatus.ARRIVED_AT_NGO,
            PickupAssignmentStatus.HANDOVER_EVIDENCE_SUBMITTED,
            PickupAssignmentStatus.OTP_VERIFIED,
            PickupAssignmentStatus.EN_ROUTE_PICKUP,
            PickupAssignmentStatus.COLLECTED,
            PickupAssignmentStatus.EN_ROUTE_DELIVERY,
        ]
        assignment = PickupAssignment.objects.filter(
            volunteer=user,
            status__in=active_statuses
        ).order_by('-assigned_at').first()

        if not assignment:
            return Response({'active_assignment': None})

        return Response({
            'active_assignment': PickupAssignmentSerializer(assignment).data
        })
