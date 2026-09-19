from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.utils import timezone
from .models import (
    PickupRequest,
    PickupAssignment,
    DonationStatusHistory,
    PickupRequestStatus,
    PickupAssignmentStatus,
)
from .serializers import (
    PickupRequestSerializer,
    CreatePickupRequestSerializer,
    PickupAssignmentSerializer,
    DonationStatusHistorySerializer,
)
from donations.models import FoodDonation, DonationStatus
from accounts.permissions import IsNGO, IsDonor, IsVolunteer
from accounts.models import UserRole
from notifications.models import Notification, NotificationType
from drf_spectacular.utils import extend_schema, OpenApiResponse


class CreatePickupRequestView(APIView):
    """
    POST /api/pickups/request/
    NGO requests an available food donation.
    """
    permission_classes = [permissions.IsAuthenticated, IsNGO]

    @extend_schema(
        summary="Create Pickup Request",
        description="NGO submits a pickup request for an available food donation.",
        request=CreatePickupRequestSerializer,
        responses={201: PickupRequestSerializer}
    )
    def post(self, request):
        user = request.user
        if not hasattr(user, 'organization'):
            return Response(
                {'error': 'User does not have an associated NGO organization profile.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        org = user.organization

        # Enforce that only verified NGOs can participate in the food-request workflow
        if not org.is_verified:
            return Response(
                {'error': 'Only verified NGOs can request surplus food. Your organization verification is currently pending review by administrators.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CreatePickupRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        donation = serializer.validated_data['donation']
        qty = serializer.validated_data.get('requested_quantity_kg') or donation.quantity_kg

        # Check organization capacity
        if org.available_capacity_kg < qty:
            return Response(
                {'error': f"Requested quantity ({qty} kg) exceeds your available capacity ({org.available_capacity_kg} kg)."},
                status=status.HTTP_400_BAD_REQUEST
            )

        pickup_req = PickupRequest.objects.create(
            donation=donation,
            organization=org,
            requested_by=user,
            requested_quantity_kg=qty,
            notes=serializer.validated_data.get('notes', '')
        )

        old_status = donation.status
        donation.status = DonationStatus.REQUESTED
        donation.save()

        # Status history
        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=old_status,
            new_status=DonationStatus.REQUESTED,
            changed_by=user,
            notes=f"Pickup requested by NGO '{org.name}' ({qty} kg)."
        )

        # Notify donor
        Notification.objects.create(
            recipient=donation.donor,
            title='New Food Rescue Request',
            message=f"NGO '{org.name}' has requested your donation '{donation.title}' ({qty} kg).",
            notification_type=NotificationType.REQUEST_RECEIVED,
            related_donation_id=str(donation.id)
        )

        return Response(PickupRequestSerializer(pickup_req).data, status=status.HTTP_201_CREATED)


class ListPickupRequestsView(generics.ListAPIView):
    """
    GET /api/pickups/requests/
    List pickup requests relevant to user (Donors see requests on their donations; NGOs see their own requests).
    """
    serializer_class = PickupRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.DONOR:
            return PickupRequest.objects.filter(donation__donor=user).order_by('-requested_at')
        elif user.role == UserRole.NGO and hasattr(user, 'organization'):
            return PickupRequest.objects.filter(organization=user.organization).order_by('-requested_at')
        elif user.role == UserRole.ADMIN:
            return PickupRequest.objects.all().order_by('-requested_at')
        return PickupRequest.objects.none()


class ApprovePickupRequestView(APIView):
    """
    POST /api/pickups/requests/{id}/approve/
    Donor approves an NGO's request. Automatically creates a PickupAssignment for volunteers.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Approve Pickup Request",
        description="Donor approves a specific NGO request for their donation. Dispatches assignment for volunteer pickup.",
        request=None,
        responses={200: PickupRequestSerializer}
    )
    def post(self, request, pk):
        try:
            pickup_req = PickupRequest.objects.get(pk=pk)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup request not found.'}, status=status.HTTP_404_NOT_FOUND)

        donation = pickup_req.donation
        if donation.donor != request.user and not (request.user.is_staff or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Only the donor can approve this request.'}, status=status.HTTP_403_FORBIDDEN)

        if pickup_req.status != PickupRequestStatus.PENDING:
            return Response({'error': f"Request is already in status '{pickup_req.status}'."}, status=status.HTTP_400_BAD_REQUEST)

        pickup_req.status = PickupRequestStatus.APPROVED
        pickup_req.save()

        old_status = donation.status
        donation.status = DonationStatus.APPROVED
        donation.save()

        # Reject any other pending requests for this same donation
        other_requests = PickupRequest.objects.filter(
            donation=donation,
            status=PickupRequestStatus.PENDING
        ).exclude(pk=pickup_req.pk)
        for req in other_requests:
            req.status = PickupRequestStatus.REJECTED
            req.save()

        # Create volunteer assignment
        assignment, _ = PickupAssignment.objects.get_or_create(
            pickup_request=pickup_req,
            defaults={'status': PickupAssignmentStatus.PENDING_VOLUNTEER}
        )

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=old_status,
            new_status=DonationStatus.APPROVED,
            changed_by=request.user,
            notes=f"Approved by donor for NGO '{pickup_req.organization.name}'."
        )

        Notification.objects.create(
            recipient=pickup_req.organization.user,
            title='Rescue Request Approved!',
            message=f"Your request for '{donation.title}' was approved by the donor. Volunteer dispatch initiated.",
            notification_type=NotificationType.REQUEST_APPROVED,
            related_donation_id=str(donation.id)
        )

        # Notify available volunteers that mission is open
        from accounts.models import VolunteerProfile
        for vol in VolunteerProfile.objects.filter(is_available=True):
            Notification.objects.create(
                recipient=vol.user,
                title='New Rescue Mission Available',
                message=f"A pickup for '{donation.title}' is approved and ready to claim.",
                notification_type=NotificationType.PICKUP_ASSIGNED,
                related_donation_id=str(donation.id)
            )

        return Response(PickupRequestSerializer(pickup_req).data, status=status.HTTP_200_OK)


class RejectPickupRequestView(APIView):
    """
    POST /api/pickups/requests/{id}/reject/
    Donor rejects an NGO request. If no more requests exist, donation status is returned to AVAILABLE.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Reject Pickup Request",
        description="Donor rejects an NGO request for their donation.",
        request=None,
        responses={200: OpenApiResponse(description="Request rejected successfully.")}
    )
    def post(self, request, pk):
        try:
            pickup_req = PickupRequest.objects.get(pk=pk)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup request not found.'}, status=status.HTTP_404_NOT_FOUND)

        donation = pickup_req.donation
        if donation.donor != request.user and not (request.user.is_staff or request.user.role == UserRole.ADMIN):
            return Response({'error': 'Only the donor can reject this request.'}, status=status.HTTP_403_FORBIDDEN)

        pickup_req.status = PickupRequestStatus.REJECTED
        pickup_req.save()

        # Check if there are other pending requests
        pending_exists = PickupRequest.objects.filter(
            donation=donation,
            status=PickupRequestStatus.PENDING
        ).exists()

        if not pending_exists and donation.status == DonationStatus.REQUESTED:
            donation.status = DonationStatus.AVAILABLE
            donation.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.REQUESTED,
            new_status=donation.status,
            changed_by=request.user,
            notes=f"Request from NGO '{pickup_req.organization.name}' was rejected by donor."
        )

        return Response({'message': 'Pickup request rejected.', 'status': pickup_req.status}, status=status.HTTP_200_OK)


class ListAvailableAssignmentsView(generics.ListAPIView):
    """
    GET /api/pickups/assignments/
    List assignments needing volunteers or assigned to current volunteer.
    """
    serializer_class = PickupAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.VOLUNTEER:
            filter_type = self.request.query_params.get('filter', 'all')
            if filter_type == 'mine':
                return PickupAssignment.objects.filter(volunteer=user).order_by('-assigned_at')
            elif filter_type == 'available':
                return PickupAssignment.objects.filter(
                    status=PickupAssignmentStatus.PENDING_VOLUNTEER,
                    volunteer__isnull=True
                ).order_by('-assigned_at')
            return PickupAssignment.objects.filter(
                models.Q(volunteer=user) | models.Q(status=PickupAssignmentStatus.PENDING_VOLUNTEER)
            ).order_by('-assigned_at')
        elif user.role == UserRole.ADMIN:
            return PickupAssignment.objects.all().order_by('-assigned_at')
        return PickupAssignment.objects.none()


class AcceptAssignmentView(APIView):
    """
    POST /api/pickups/assignments/{id}/accept/
    Volunteer claims an open pickup assignment.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    @extend_schema(
        summary="Accept Pickup Assignment",
        description="Volunteer claims an open rescue assignment.",
        request=None,
        responses={200: PickupAssignmentSerializer}
    )
    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Pickup assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer is not None and assignment.volunteer != request.user:
            return Response({'error': 'This assignment is already claimed by another volunteer.'}, status=status.HTTP_400_BAD_REQUEST)

        assignment.volunteer = request.user
        assignment.status = PickupAssignmentStatus.ASSIGNED
        assignment.save()

        donation = assignment.pickup_request.donation
        old_status = donation.status
        donation.status = DonationStatus.ASSIGNED
        donation.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=old_status,
            new_status=DonationStatus.ASSIGNED,
            changed_by=request.user,
            notes=f"Accepted by Volunteer {request.user.get_full_name() or request.user.username}."
        )

        # Notify donor and NGO
        Notification.objects.create(
            recipient=donation.donor,
            title='Volunteer Assigned to Your Donation',
            message=f"Volunteer {request.user.get_full_name() or request.user.username} will pick up '{donation.title}'.",
            notification_type=NotificationType.PICKUP_ASSIGNED,
            related_donation_id=str(donation.id)
        )
        Notification.objects.create(
            recipient=assignment.pickup_request.organization.user,
            title='Volunteer Assigned to Pickup',
            message=f"Volunteer {request.user.get_full_name() or request.user.username} is handling the pickup.",
            notification_type=NotificationType.PICKUP_ASSIGNED,
            related_donation_id=str(donation.id)
        )

        return Response(PickupAssignmentSerializer(assignment).data, status=status.HTTP_200_OK)


class CollectFoodView(APIView):
    """
    POST /api/pickups/assignments/{id}/collect/
    Volunteer confirms food collected from donor premises.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    @extend_schema(
        summary="Confirm Food Collected",
        description="Volunteer confirms collecting the food batch from donor premises.",
        responses={200: PickupAssignmentSerializer}
    )
    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the assigned volunteer can update collection status.'}, status=status.HTTP_403_FORBIDDEN)

        assignment.status = PickupAssignmentStatus.COLLECTED
        assignment.collected_at = timezone.now()
        assignment.proof_image_url = request.data.get('proof_image_url', assignment.proof_image_url)
        assignment.delivery_notes = request.data.get('delivery_notes', assignment.delivery_notes)
        assignment.save()

        donation = assignment.pickup_request.donation
        donation.status = DonationStatus.PICKED_UP
        donation.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.ASSIGNED,
            new_status=DonationStatus.PICKED_UP,
            changed_by=request.user,
            notes='Food successfully collected from donor. In transit to destination NGO.'
        )

        Notification.objects.create(
            recipient=assignment.pickup_request.organization.user,
            title='Food Collected & En Route',
            message=f"Volunteer {request.user.get_full_name() or request.user.username} collected '{donation.title}' and is traveling to your facility.",
            notification_type=NotificationType.PICKUP_IN_TRANSIT,
            related_donation_id=str(donation.id)
        )

        return Response(PickupAssignmentSerializer(assignment).data, status=status.HTTP_200_OK)


class DeliverFoodView(APIView):
    """
    POST /api/pickups/assignments/{id}/deliver/
    Volunteer confirms arrival and drop-off at NGO facility.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    @extend_schema(
        summary="Confirm Food Delivered",
        description="Volunteer confirms drop-off of food at the destination NGO.",
        request=None,
        responses={200: PickupAssignmentSerializer}
    )
    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the assigned volunteer can mark delivery.'}, status=status.HTTP_403_FORBIDDEN)

        assignment.status = PickupAssignmentStatus.DELIVERED
        assignment.delivered_at = timezone.now()
        assignment.save()

        donation = assignment.pickup_request.donation
        donation.status = DonationStatus.DELIVERED
        donation.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.PICKED_UP,
            new_status=DonationStatus.DELIVERED,
            changed_by=request.user,
            notes='Food delivered at NGO. Awaiting NGO verification and final confirmation.'
        )

        Notification.objects.create(
            recipient=assignment.pickup_request.organization.user,
            title='Food Delivered at Your Location',
            message=f"Food from '{donation.title}' has been delivered. Please confirm receipt.",
            notification_type=NotificationType.DELIVERY_COMPLETED,
            related_donation_id=str(donation.id)
        )

        return Response(PickupAssignmentSerializer(assignment).data, status=status.HTTP_200_OK)


class ConfirmDeliveryView(APIView):
    """
    POST /api/pickups/assignments/{id}/confirm/
    NGO confirms receiving food -> marks rescue as COMPLETED.
    """
    permission_classes = [permissions.IsAuthenticated, IsNGO]

    @extend_schema(
        summary="Confirm Delivery & Complete Mission",
        description="NGO verifies and confirms delivery receipt. Marks food rescue mission COMPLETED.",
        responses={200: OpenApiResponse(description="Rescue completed successfully.")}
    )
    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        org = assignment.pickup_request.organization
        if org.user != request.user and not request.user.is_staff:
            return Response({'error': 'Only the receiving NGO can confirm completion.'}, status=status.HTTP_403_FORBIDDEN)

        rating = request.data.get('rating')
        if rating:
            try:
                assignment.rating_by_ngo = float(rating)
            except ValueError:
                pass

        assignment.status = PickupAssignmentStatus.CONFIRMED_BY_NGO
        assignment.confirmed_at = timezone.now()
        assignment.save()

        donation = assignment.pickup_request.donation
        donation.status = DonationStatus.COMPLETED
        donation.save()

        # Update stats
        qty = assignment.pickup_request.requested_quantity_kg or donation.quantity_kg
        org.total_rescued_kg += qty
        org.total_pickups_completed += 1
        org.save()

        if assignment.volunteer and hasattr(assignment.volunteer, 'volunteer_profile'):
            v_profile = assignment.volunteer.volunteer_profile
            v_profile.total_pickups_completed += 1
            if assignment.rating_by_ngo:
                # Running average rating
                prev_total = v_profile.rating * max(1, v_profile.total_pickups_completed - 1)
                v_profile.rating = round((prev_total + assignment.rating_by_ngo) / v_profile.total_pickups_completed, 2)
            v_profile.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.DELIVERED,
            new_status=DonationStatus.COMPLETED,
            changed_by=request.user,
            notes=f"NGO confirmed receipt of {qty} kg food rescue. Completed successfully!"
        )

        Notification.objects.create(
            recipient=donation.donor,
            title='Rescue Completed! 🎉',
            message=f"Your donation '{donation.title}' was successfully delivered and served to beneficiaries.",
            notification_type=NotificationType.DELIVERY_COMPLETED,
            related_donation_id=str(donation.id)
        )

        if assignment.volunteer:
            Notification.objects.create(
                recipient=assignment.volunteer,
                title='Mission Verified & Completed! 🏆',
                message=f"NGO '{org.name}' verified delivery of '{donation.title}'. Your rescue stats have been updated!",
                notification_type=NotificationType.DELIVERY_COMPLETED,
                related_donation_id=str(donation.id)
            )

        return Response({
            'message': 'Donation rescue completed successfully.',
            'status': DonationStatus.COMPLETED,
            'rescued_kg': qty
        }, status=status.HTTP_200_OK)


class DonationStatusHistoryView(generics.ListAPIView):
    """
    GET /api/pickups/history/{donation_id}/
    Full chronological audit trail of all status transitions for a donation.
    """
    serializer_class = DonationStatusHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        donation_id = self.kwargs['donation_id']
        return DonationStatusHistory.objects.filter(donation__id=donation_id).order_by('-timestamp')
