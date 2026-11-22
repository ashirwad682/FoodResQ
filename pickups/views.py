import os
import uuid
import base64
import secrets
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.conf import settings
from django.utils import timezone
from .models import (
    PickupRequest,
    PickupAssignment,
    DonationStatusHistory,
    DeliveryVerification,
    DeliveryEvidence,
    DeliveryAuditLog,
    PickupRequestStatus,
    PickupAssignmentStatus,
    VerificationStatus,
)
from .serializers import (
    PickupRequestSerializer,
    CreatePickupRequestSerializer,
    PickupAssignmentSerializer,
    DonationStatusHistorySerializer,
    DeliveryVerificationSerializer,
    DeliveryEvidenceSerializer,
    DeliveryAuditLogSerializer,
)
from donations.models import FoodDonation, DonationStatus
from accounts.permissions import IsNGO, IsDonor, IsVolunteer
from accounts.models import UserRole
from notifications.models import Notification, NotificationType
from drf_spectacular.utils import extend_schema, OpenApiResponse


def save_evidence_image(file_or_b64):
    """
    Saves an uploaded image file or base64 data URL to media/delivery_evidence/
    Returns accessible media URL path.
    """
    evidence_dir = os.path.join(settings.MEDIA_ROOT, 'delivery_evidence')
    os.makedirs(evidence_dir, exist_ok=True)
    filename = f"evidence_{uuid.uuid4().hex[:16]}.jpg"

    if hasattr(file_or_b64, 'read'):
        file_path = os.path.join(evidence_dir, filename)
        with open(file_path, 'wb+') as destination:
            for chunk in file_or_b64.chunks():
                destination.write(chunk)
        return f"{settings.MEDIA_URL}delivery_evidence/{filename}"
    elif isinstance(file_or_b64, str):
        if file_or_b64.startswith('data:image'):
            header, encoded = file_or_b64.split(',', 1)
            ext = 'jpg'
            if 'image/png' in header:
                ext = 'png'
            elif 'image/webp' in header:
                ext = 'webp'
            filename = f"evidence_{uuid.uuid4().hex[:16]}.{ext}"
            file_path = os.path.join(evidence_dir, filename)
            with open(file_path, 'wb') as f:
                f.write(base64.b64decode(encoded))
            return f"{settings.MEDIA_URL}delivery_evidence/{filename}"
        elif file_or_b64.startswith('http://') or file_or_b64.startswith('https://') or file_or_b64.startswith('/media/'):
            return file_or_b64
    return ''


class CreatePickupRequestView(APIView):
    """
    POST /api/pickups/request/
    NGO requests an available food donation.
    Multiple NGOs can submit competing requests before acceptance without removing the food from the marketplace.
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

        # Prevent duplicate requests from the same NGO
        existing_request = PickupRequest.objects.filter(
            donation=donation,
            organization=org,
            status__in=[PickupRequestStatus.PENDING, PickupRequestStatus.APPROVED]
        ).first()

        if existing_request:
            if existing_request.status == PickupRequestStatus.APPROVED:
                return Response(
                    {'error': 'Your organization has already been accepted and reserved for this food donation.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {'error': 'Your organization has already submitted a pending claim for this food batch. Awaiting donor decision.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Concurrency & exclusive reservation validation
        if donation.status in [
            DonationStatus.APPROVED,
            DonationStatus.ASSIGNED,
            DonationStatus.PICKED_UP,
            DonationStatus.DELIVERED,
            DonationStatus.COMPLETED,
            DonationStatus.CANCELLED,
            DonationStatus.EXPIRED,
        ]:
            return Response(
                {'error': 'This food donation has already been accepted and exclusively reserved for another shelter organization.'},
                status=status.HTTP_409_CONFLICT
            )

        pickup_req = PickupRequest.objects.create(
            donation=donation,
            organization=org,
            requested_by=user,
            requested_quantity_kg=qty,
            notes=serializer.validated_data.get('notes', ''),
            status=PickupRequestStatus.PENDING
        )

        # Keep donation available for competing NGO claims until donor accepts one
        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=donation.status,
            new_status=donation.status,
            changed_by=user,
            notes=f"Pickup request submitted by NGO '{org.name}' ({qty} kg). Food remains available for other NGOs until donor acceptance."
        )

        # Notify donor of incoming request
        Notification.objects.create(
            recipient=donation.donor,
            title='New Food Rescue Request',
            message=f"NGO '{org.name}' has requested your donation '{donation.title}' ({qty} kg). Review and approve in your dashboard.",
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
    Donor approves an NGO's request. Concurrency-protected via atomic conditional update.
    Dispatches assignment for volunteer pickup and closes competing requests.
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
            return Response({'error': f"Request cannot be approved; it is currently '{pickup_req.status}'."}, status=status.HTTP_400_BAD_REQUEST)

        # Atomic conditional update on FoodDonation to prevent race conditions & duplicate claims
        # Succeeds only if donation is currently unreserved (AVAILABLE or REQUESTED)
        updated_count = FoodDonation.objects.filter(
            pk=donation.pk,
            status__in=[DonationStatus.AVAILABLE, DonationStatus.REQUESTED]
        ).update(status=DonationStatus.APPROVED)

        if updated_count == 0:
            return Response(
                {'error': 'This food donation is no longer available or has already been exclusively reserved for another shelter.'},
                status=status.HTTP_409_CONFLICT
            )

        pickup_req.status = PickupRequestStatus.APPROVED
        pickup_req.save()
        donation.refresh_from_db()

        # Reject and notify all other pending requests for this same donation
        other_requests = PickupRequest.objects.filter(
            donation=donation,
            status=PickupRequestStatus.PENDING
        ).exclude(pk=pickup_req.pk)
        for req in other_requests:
            req.status = PickupRequestStatus.REJECTED
            req.save()
            if req.requested_by:
                Notification.objects.create(
                    recipient=req.requested_by,
                    title='Donation Claim Not Selected',
                    message=f"The donor has accepted another shelter's request for '{donation.title}'. This batch is no longer available.",
                    notification_type=NotificationType.REQUEST_REJECTED,
                    related_donation_id=str(donation.id)
                )

        # Create or update volunteer assignment
        assignment, _ = PickupAssignment.objects.get_or_create(
            pickup_request=pickup_req,
            defaults={'status': PickupAssignmentStatus.PENDING_VOLUNTEER}
        )

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.AVAILABLE,
            new_status=DonationStatus.APPROVED,
            changed_by=request.user,
            notes=f"Approved exclusively for NGO '{pickup_req.organization.name}'. Other pending requests closed."
        )

        if pickup_req.organization.user:
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

        resp_data = PickupRequestSerializer(pickup_req).data
        resp_data['assignment_id'] = str(assignment.id)
        return Response(resp_data, status=status.HTTP_200_OK)


class CancelPickupRequestView(APIView):
    """
    POST /api/pickups/requests/{id}/cancel/
    NGO cancels a pending request or an approved reservation before courier pickup.
    Releases donation back to marketplace as AVAILABLE if it was approved.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Cancel Pickup Request",
        description="NGO cancels their request or accepted reservation prior to courier pickup.",
        request=None,
        responses={200: OpenApiResponse(description="Request cancelled successfully.")}
    )
    def post(self, request, pk):
        try:
            pickup_req = PickupRequest.objects.get(pk=pk)
        except PickupRequest.DoesNotExist:
            return Response({'error': 'Pickup request not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        org = getattr(user, 'organization', None)

        if user.role == UserRole.NGO:
            if not org or pickup_req.organization != org:
                return Response({'error': 'You can only cancel your own organization requests.'}, status=status.HTTP_403_FORBIDDEN)
        elif not (user.is_staff or user.role == UserRole.ADMIN):
            return Response({'error': 'Unauthorized to cancel this request.'}, status=status.HTTP_403_FORBIDDEN)

        if pickup_req.status in [PickupRequestStatus.REJECTED, PickupRequestStatus.CANCELLED]:
            return Response({'error': f"Request is already '{pickup_req.status}'."}, status=status.HTTP_400_BAD_REQUEST)

        donation = pickup_req.donation

        # If already approved, check if food has already been collected/picked up
        if pickup_req.status == PickupRequestStatus.APPROVED:
            has_been_picked_up = False
            if hasattr(pickup_req, 'assignment') and pickup_req.assignment:
                assignment = pickup_req.assignment
                if assignment.status in [
                    PickupAssignmentStatus.PICKED_UP,
                    PickupAssignmentStatus.IN_TRANSIT,
                    PickupAssignmentStatus.ARRIVED_AT_NGO,
                    PickupAssignmentStatus.HANDOVER_EVIDENCE_SUBMITTED,
                    PickupAssignmentStatus.OTP_VERIFIED,
                    PickupAssignmentStatus.DELIVERED,
                    PickupAssignmentStatus.CONFIRMED_BY_NGO
                ]:
                    has_been_picked_up = True

            if donation.status in [
                DonationStatus.PICKED_UP,
                DonationStatus.DELIVERED,
                DonationStatus.COMPLETED
            ]:
                has_been_picked_up = True

            if has_been_picked_up:
                return Response(
                    {'error': 'Cannot cancel reservation: Food has already been collected from the donor by courier rider.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Cancel the assignment if exists
            if hasattr(pickup_req, 'assignment') and pickup_req.assignment:
                pickup_req.assignment.delete()

            # Mark request as CANCELLED
            pickup_req.status = PickupRequestStatus.CANCELLED
            pickup_req.save()

            # Release food donation back to AVAILABLE for marketplace
            FoodDonation.objects.filter(pk=donation.pk).update(status=DonationStatus.AVAILABLE)
            donation.refresh_from_db()

            DonationStatusHistory.objects.create(
                donation=donation,
                old_status=DonationStatus.APPROVED,
                new_status=DonationStatus.AVAILABLE,
                changed_by=user,
                notes=f"Reservation cancelled by NGO '{pickup_req.organization.name}'. Food batch released back to marketplace as AVAILABLE."
            )

            # Notify Donor
            Notification.objects.create(
                recipient=donation.donor,
                title='Shelter Reservation Cancelled',
                message=f"NGO '{pickup_req.organization.name}' has cancelled their reservation for '{donation.title}'. Your batch is back on the marketplace for other shelters to claim.",
                notification_type=NotificationType.SYSTEM,
                related_donation_id=str(donation.id)
            )

            return Response({
                'message': 'Reservation cancelled successfully. Food batch has been released back to the marketplace.',
                'status': pickup_req.status
            }, status=status.HTTP_200_OK)

        else:
            # If request was still PENDING
            pickup_req.status = PickupRequestStatus.CANCELLED
            pickup_req.save()

            DonationStatusHistory.objects.create(
                donation=donation,
                old_status=donation.status,
                new_status=donation.status,
                changed_by=user,
                notes=f"Pending claim withdrawn by NGO '{pickup_req.organization.name}'."
            )

            return Response({
                'message': 'Pending claim withdrawn successfully.',
                'status': pickup_req.status
            }, status=status.HTTP_200_OK)


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
                    status=PickupAssignmentStatus.PENDING_VOLUNTEER
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
        request=None,
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
        request=None,
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


class UploadEvidencePhotoView(APIView):
    """
    POST /api/pickups/upload-photo/
    Accepts multipart file or base64 data string, validates image format and size (<=10MB),
    and saves to media/delivery_evidence/.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get('photo')
        photo_data = request.data.get('photo_data') or request.data.get('photo_url')

        if not uploaded_file and not photo_data:
            return Response({'error': 'No photograph provided. A photograph is mandatory.'}, status=status.HTTP_400_BAD_REQUEST)

        if uploaded_file:
            if uploaded_file.size > 10 * 1024 * 1024:
                return Response({'error': 'Photograph file size exceeds maximum limit of 10MB.'}, status=status.HTTP_400_BAD_REQUEST)
            content_type = getattr(uploaded_file, 'content_type', '')
            if content_type and not content_type.startswith('image/'):
                return Response({'error': 'Uploaded file must be a valid image (JPEG/PNG/WebP).'}, status=status.HTTP_400_BAD_REQUEST)

        photo_url = save_evidence_image(uploaded_file or photo_data)
        if not photo_url:
            return Response({'error': 'Failed to process evidence photograph.'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'photo_url': photo_url, 'message': 'Evidence photograph saved successfully.'}, status=status.HTTP_201_CREATED)


class UpdateAssignmentStatusView(APIView):
    """
    POST /api/pickups/assignments/{id}/status/
    Updates transitional statuses: ARRIVED_AT_DONOR, IN_TRANSIT, ARRIVED_AT_NGO.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the assigned volunteer can update courier status.'}, status=status.HTTP_403_FORBIDDEN)

        target_status = request.data.get('status')
        valid_transitions = [
            PickupAssignmentStatus.ARRIVED_AT_DONOR,
            PickupAssignmentStatus.IN_TRANSIT,
            PickupAssignmentStatus.ARRIVED_AT_NGO,
        ]
        if target_status not in valid_transitions:
            return Response({'error': f'Invalid status transition target: {target_status}'}, status=status.HTTP_400_BAD_REQUEST)

        if target_status == PickupAssignmentStatus.IN_TRANSIT:
            if assignment.status not in [PickupAssignmentStatus.PICKED_UP, PickupAssignmentStatus.COLLECTION_EVIDENCE_SUBMITTED, PickupAssignmentStatus.COLLECTED]:
                return Response({'error': 'Cannot enter IN_TRANSIT before collection evidence is submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        if target_status == PickupAssignmentStatus.ARRIVED_AT_NGO:
            if assignment.status not in [PickupAssignmentStatus.IN_TRANSIT, PickupAssignmentStatus.PICKED_UP, PickupAssignmentStatus.COLLECTED]:
                return Response({'error': 'Cannot arrive at NGO before food is collected.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = assignment.status
        assignment.status = target_status
        assignment.save()

        verification, _ = DeliveryVerification.objects.get_or_create(
            assignment=assignment,
            defaults={
                'donation': assignment.pickup_request.donation,
                'donor': assignment.pickup_request.donation.donor,
                'ngo': assignment.pickup_request.organization,
                'volunteer': assignment.volunteer,
            }
        )

        if target_status == PickupAssignmentStatus.ARRIVED_AT_DONOR:
            verification.verification_status = VerificationStatus.ARRIVED_DONOR
        elif target_status == PickupAssignmentStatus.IN_TRANSIT:
            verification.verification_status = VerificationStatus.IN_TRANSIT
        elif target_status == PickupAssignmentStatus.ARRIVED_AT_NGO:
            verification.verification_status = VerificationStatus.ARRIVED_NGO
            # Notify NGO shelter that courier arrived
            Notification.objects.create(
                recipient=assignment.pickup_request.organization.user,
                title='Courier Arrived at Your Shelter',
                message=f"Courier {request.user.get_full_name() or request.user.username} has arrived at your facility with '{assignment.pickup_request.donation.title}'. Prepare for handover verification.",
                notification_type=NotificationType.ARRIVED_AT_NGO,
                related_donation_id=str(assignment.pickup_request.donation.id),
                related_assignment_id=str(assignment.id),
            )
        verification.save()

        DeliveryAuditLog.objects.create(
            assignment=assignment,
            action=f"STATUS_TRANSITION_TO_{target_status}",
            performed_by=request.user,
            performed_by_role='VOLUNTEER',
            metadata={'old_status': old_status, 'new_status': target_status}
        )

        return Response(PickupAssignmentSerializer(assignment, context={'request': request}).data, status=status.HTTP_200_OK)


class SubmitCollectionEvidenceView(APIView):
    """
    POST /api/pickups/assignments/{id}/collection-evidence/
    Volunteer captures and submits mandatory photo of food collected from Donor premises.
    Includes timestamp and location coordinates.
    Validates collection and updates donation status to PICKED_UP.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the assigned volunteer can submit collection evidence.'}, status=status.HTTP_403_FORBIDDEN)

        photo_url = request.data.get('photo_url')
        if not photo_url and request.FILES.get('photo'):
            photo_url = save_evidence_image(request.FILES['photo'])
        elif not photo_url and request.data.get('photo_data'):
            photo_url = save_evidence_image(request.data['photo_data'])

        if not photo_url:
            return Response({'error': 'Collection photograph is MANDATORY. Please capture a photograph of the food.'}, status=status.HTTP_400_BAD_REQUEST)

        location = request.data.get('location') or {}
        notes = request.data.get('notes', '')
        confirm_pickup = request.data.get('confirm_pickup', True)

        now = timezone.now()
        donation = assignment.pickup_request.donation
        ngo = assignment.pickup_request.organization

        verification, _ = DeliveryVerification.objects.get_or_create(
            assignment=assignment,
            defaults={
                'donation': donation,
                'donor': donation.donor,
                'ngo': ngo,
                'volunteer': request.user,
            }
        )
        verification.collection_photo_url = photo_url
        verification.collection_timestamp = now
        verification.collection_location = location
        if notes:
            verification.notes = notes

        DeliveryEvidence.objects.create(
            assignment=assignment,
            evidence_type='COLLECTION',
            photo_url=photo_url,
            uploaded_by=request.user,
            location=location,
            verification_status='VALID'
        )

        if confirm_pickup:
            verification.collection_confirmed = True
            verification.verification_status = VerificationStatus.PICKED_UP
            assignment.status = PickupAssignmentStatus.PICKED_UP
            assignment.collected_at = now
            assignment.proof_image_url = photo_url
            if notes:
                assignment.delivery_notes = notes
            assignment.save()

            donation.status = DonationStatus.PICKED_UP
            donation.save()

            DonationStatusHistory.objects.create(
                donation=donation,
                old_status=DonationStatus.ASSIGNED,
                new_status=DonationStatus.PICKED_UP,
                changed_by=request.user,
                notes=f"Food collection photo validated and confirmed by courier {request.user.get_full_name() or request.user.username}."
            )

            Notification.objects.create(
                recipient=donation.donor,
                title='Food Collection Confirmed with Photo Evidence',
                message=f"Volunteer {request.user.get_full_name() or request.user.username} has verified and collected your donation '{donation.title}'. Courier is now en route to {ngo.name}.",
                notification_type=NotificationType.FOOD_COLLECTED,
                related_donation_id=str(donation.id),
                related_assignment_id=str(assignment.id),
                data={'photo_url': photo_url, 'timestamp': now.isoformat()}
            )
            Notification.objects.create(
                recipient=ngo.user,
                title='Food Collected from Donor & In Transit',
                message=f"Courier {request.user.get_full_name() or request.user.username} has collected '{donation.title}' with verified photo evidence. Moving toward your facility.",
                notification_type=NotificationType.PICKUP_IN_TRANSIT,
                related_donation_id=str(donation.id),
                related_assignment_id=str(assignment.id),
            )
        else:
            verification.verification_status = VerificationStatus.COLLECTION_SUBMITTED
            assignment.status = PickupAssignmentStatus.COLLECTION_EVIDENCE_SUBMITTED
            assignment.save()

        verification.save()

        DeliveryAuditLog.objects.create(
            assignment=assignment,
            action='COLLECTION_EVIDENCE_SUBMITTED',
            performed_by=request.user,
            performed_by_role='VOLUNTEER',
            metadata={'photo_url': photo_url, 'location': location, 'confirmed': confirm_pickup}
        )

        return Response(PickupAssignmentSerializer(assignment, context={'request': request}).data, status=status.HTTP_200_OK)


class GenerateHandoverOtpView(APIView):
    """
    POST /api/pickups/assignments/{id}/generate-otp/
    Generates a unique 6-digit OTP valid for exactly 60 seconds (1 minute).
    Sends OTP notification directly to registered NGO account.
    Visible ONLY to the authorized NGO account.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        donation = assignment.pickup_request.donation
        ngo = assignment.pickup_request.organization
        is_assigned_vol = assignment.volunteer == user
        is_assigned_ngo = (hasattr(user, 'organization') and user.organization == ngo) or (user == ngo.user)
        is_admin = user.is_staff or getattr(user, 'role', '') == UserRole.ADMIN

        if not (is_assigned_vol or is_assigned_ngo or is_admin):
            return Response({'error': 'You do not have permission to trigger OTP generation for this delivery.'}, status=status.HTTP_403_FORBIDDEN)

        verification, _ = DeliveryVerification.objects.get_or_create(
            assignment=assignment,
            defaults={
                'donation': donation,
                'donor': donation.donor,
                'ngo': ngo,
                'volunteer': assignment.volunteer,
            }
        )

        # Rate-limiting: prevent spamming resend within 5 seconds
        if verification.otp_created_at:
            delta = (timezone.now() - verification.otp_created_at).total_seconds()
            if delta < 5:
                return Response({'error': f'Please wait {int(5 - delta)}s before requesting a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        plain_otp = verification.generate_otp(expiry_seconds=60)
        v_name = assignment.volunteer.get_full_name() or assignment.volunteer.username if assignment.volunteer else 'Courier'
        qty = assignment.pickup_request.requested_quantity_kg or donation.quantity_kg

        Notification.objects.create(
            recipient=ngo.user,
            title='Food Delivery Verification Required',
            message=f"Courier {v_name} is handing over '{donation.title}' ({qty} kg). Single-use 6-digit verification OTP: {plain_otp}. Valid for 60 seconds.",
            notification_type=NotificationType.OTP_GENERATED,
            related_donation_id=str(donation.id),
            related_assignment_id=str(assignment.id),
            data={
                'otp': plain_otp,
                'expires_at': verification.otp_expires_at.isoformat(),
                'assignment_id': str(assignment.id),
                'volunteer_name': v_name,
                'food_name': donation.title,
                'food_quantity': qty,
                'duration_seconds': 60,
            }
        )

        DeliveryAuditLog.objects.create(
            assignment=assignment,
            action='OTP_GENERATED',
            performed_by=user,
            performed_by_role=getattr(user, 'role', 'USER'),
            metadata={'expires_in': 60, 'ngo_id': str(ngo.id)}
        )

        resp = {
            'message': '6-digit Handover verification OTP generated. Sent to NGO shelter notification center.',
            'expires_at': verification.otp_expires_at.isoformat(),
            'remaining_seconds': 60,
            'duration_seconds': 60,
            'assignment_id': str(assignment.id),
        }
        if is_assigned_ngo or is_admin:
            resp['otp'] = plain_otp

        return Response(resp, status=status.HTTP_200_OK)


class SubmitHandoverEvidenceView(APIView):
    """
    POST /api/pickups/assignments/{id}/handover-evidence/
    Volunteer captures mandatory handover photograph showing food handed over to NGO representative.
    Includes timestamp and location coordinates.
    Updates status to HANDOVER_EVIDENCE_SUBMITTED.
    NOTE: Does not complete delivery - awaiting NGO OTP verification.
    """
    permission_classes = [permissions.IsAuthenticated, IsVolunteer]

    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if assignment.volunteer != request.user and not request.user.is_staff:
            return Response({'error': 'Only the assigned volunteer can submit handover evidence.'}, status=status.HTTP_403_FORBIDDEN)

        photo_url = request.data.get('photo_url')
        if not photo_url and request.FILES.get('photo'):
            photo_url = save_evidence_image(request.FILES['photo'])
        elif not photo_url and request.data.get('photo_data'):
            photo_url = save_evidence_image(request.data['photo_data'])

        if not photo_url:
            return Response({'error': 'Handover photograph is MANDATORY. Please capture a photograph showing food handover to NGO representative.'}, status=status.HTTP_400_BAD_REQUEST)

        location = request.data.get('location') or {}
        notes = request.data.get('notes', '')
        now = timezone.now()

        donation = assignment.pickup_request.donation
        ngo = assignment.pickup_request.organization

        verification, _ = DeliveryVerification.objects.get_or_create(
            assignment=assignment,
            defaults={
                'donation': donation,
                'donor': donation.donor,
                'ngo': ngo,
                'volunteer': request.user,
            }
        )

        verification.handover_photo_url = photo_url
        verification.handover_timestamp = now
        verification.handover_location = location
        if notes:
            verification.notes = (verification.notes + " | " + notes).strip(" | ")
        verification.verification_status = VerificationStatus.HANDOVER_SUBMITTED
        verification.save()

        DeliveryEvidence.objects.create(
            assignment=assignment,
            evidence_type='HANDOVER',
            photo_url=photo_url,
            uploaded_by=request.user,
            location=location,
            verification_status='VALID'
        )

        assignment.status = PickupAssignmentStatus.HANDOVER_EVIDENCE_SUBMITTED
        assignment.save()

        # If no active unexpired OTP exists, automatically generate one for the NGO now
        plain_otp = None
        if not verification.otp_expires_at or timezone.now() > verification.otp_expires_at:
            plain_otp = verification.generate_otp(expiry_seconds=60)
            v_name = request.user.get_full_name() or request.user.username
            qty = assignment.pickup_request.requested_quantity_kg or donation.quantity_kg
            Notification.objects.create(
                recipient=ngo.user,
                title='Food Delivery Verification Required',
                message=f"Courier {v_name} has submitted handover photo for '{donation.title}' ({qty} kg). Single-use 6-digit OTP: {plain_otp}. Valid for 60 seconds.",
                notification_type=NotificationType.OTP_GENERATED,
                related_donation_id=str(donation.id),
                related_assignment_id=str(assignment.id),
                data={
                    'otp': plain_otp,
                    'expires_at': verification.otp_expires_at.isoformat(),
                    'assignment_id': str(assignment.id),
                    'volunteer_name': v_name,
                    'food_name': donation.title,
                    'food_quantity': qty,
                    'duration_seconds': 60,
                }
            )

        DeliveryAuditLog.objects.create(
            assignment=assignment,
            action='HANDOVER_EVIDENCE_SUBMITTED',
            performed_by=request.user,
            performed_by_role='VOLUNTEER',
            metadata={'photo_url': photo_url, 'location': location}
        )

        return Response(PickupAssignmentSerializer(assignment, context={'request': request}).data, status=status.HTTP_200_OK)


class VerifyHandoverOtpView(APIView):
    """
    POST /api/pickups/assignments/{id}/verify-otp/
    NGO or assigned Volunteer verifies the 6-digit OTP within the 60-second window.
    Enforces server-side expiration, single-use, rate limiting, and completes delivery.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        ngo = assignment.pickup_request.organization
        is_ngo_user = (ngo.user == request.user) or (hasattr(request.user, 'organization') and request.user.organization == ngo)
        is_assigned_volunteer = (assignment.volunteer == request.user)
        is_staff = request.user.is_staff or getattr(request.user, 'role', '') == 'ADMIN'

        if not (is_ngo_user or is_assigned_volunteer or is_staff):
            return Response(
                {'error': 'Only the assigned NGO shelter or the assigned volunteer courier can submit the verification OTP.'},
                status=status.HTTP_403_FORBIDDEN
            )

        otp = request.data.get('otp')
        if not otp:
            return Response({'error': 'Six-digit OTP is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = assignment.verification
        except DeliveryVerification.DoesNotExist:
            return Response({'error': 'No delivery verification record exists for this assignment.'}, status=status.HTTP_400_BAD_REQUEST)

        if not verification.collection_photo_url:
            return Response({'error': 'Collection photo evidence missing from record.'}, status=status.HTTP_400_BAD_REQUEST)
        if not verification.handover_photo_url:
            return Response({'error': 'Handover photo evidence has not been submitted by courier.'}, status=status.HTTP_400_BAD_REQUEST)

        if verification.verification_status == VerificationStatus.DELIVERED or verification.otp_verified_at:
            return Response({'error': 'This delivery has already been verified and completed.'}, status=status.HTTP_400_BAD_REQUEST)

        performed_role = 'NGO' if is_ngo_user else ('VOLUNTEER' if is_assigned_volunteer else 'ADMIN')

        is_valid, msg = verification.verify_otp(otp, request.user)
        if not is_valid:
            DeliveryAuditLog.objects.create(
                assignment=assignment,
                action='OTP_VERIFICATION_FAILED',
                performed_by=request.user,
                performed_by_role=performed_role,
                metadata={'reason': msg, 'attempts': verification.otp_attempts}
            )
            return Response({'error': msg, 'attempts': verification.otp_attempts}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        verification.verification_status = VerificationStatus.DELIVERED
        verification.save()

        assignment.status = PickupAssignmentStatus.DELIVERED
        assignment.delivered_at = now
        assignment.confirmed_at = now
        rating = request.data.get('rating')
        if rating:
            try:
                assignment.rating_by_ngo = float(rating)
            except ValueError:
                pass
        assignment.save()

        donation = assignment.pickup_request.donation
        donation.status = DonationStatus.COMPLETED
        donation.save()

        qty = assignment.pickup_request.requested_quantity_kg or donation.quantity_kg
        ngo.total_rescued_kg += qty
        ngo.total_pickups_completed += 1
        ngo.save()

        if assignment.volunteer and hasattr(assignment.volunteer, 'volunteer_profile'):
            v_profile = assignment.volunteer.volunteer_profile
            v_profile.total_pickups_completed += 1
            if assignment.rating_by_ngo:
                prev_total = v_profile.rating * max(1, v_profile.total_pickups_completed - 1)
                v_profile.rating = round((prev_total + assignment.rating_by_ngo) / v_profile.total_pickups_completed, 2)
            v_profile.save()

        DonationStatusHistory.objects.create(
            donation=donation,
            old_status=DonationStatus.PICKED_UP,
            new_status=DonationStatus.COMPLETED,
            changed_by=request.user,
            notes=f"NGO '{ngo.name}' verified delivery via 60s OTP. {qty} kg surplus food safely transferred."
        )

        DeliveryAuditLog.objects.create(
            assignment=assignment,
            action='OTP_VERIFIED_AND_DELIVERED',
            performed_by=request.user,
            performed_by_role='NGO',
            metadata={'rescued_kg': qty, 'rating': assignment.rating_by_ngo}
        )

        if assignment.volunteer:
            Notification.objects.create(
                recipient=assignment.volunteer,
                title='Mission Verified & Completed! 🏆',
                message=f"NGO '{ngo.name}' verified handover via 6-digit OTP. {qty} kg successfully transferred. Thank you for your service!",
                notification_type=NotificationType.DELIVERY_COMPLETED,
                related_donation_id=str(donation.id),
                related_assignment_id=str(assignment.id)
            )

        Notification.objects.create(
            recipient=donation.donor,
            title='Rescue Completed! 🎉',
            message=f"Your donation '{donation.title}' was verified via secure OTP and received by '{ngo.name}'. Handover photo is now available in your audit report.",
            notification_type=NotificationType.DELIVERY_COMPLETED,
            related_donation_id=str(donation.id),
            related_assignment_id=str(assignment.id),
            data={'collection_photo': verification.collection_photo_url, 'handover_photo': verification.handover_photo_url}
        )

        return Response({
            'message': 'Delivery successfully verified via 6-digit OTP. Mission marked DELIVERED.',
            'status': PickupAssignmentStatus.DELIVERED,
            'assignment': PickupAssignmentSerializer(assignment, context={'request': request}).data,
            'rescued_kg': qty
        }, status=status.HTTP_200_OK)


class GetVerificationDetailsView(APIView):
    """
    GET /api/pickups/assignments/{id}/verification/
    Returns verification details, evidence photos, and audit logs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            assignment = PickupAssignment.objects.get(pk=pk)
        except PickupAssignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            verification = assignment.verification
        except DeliveryVerification.DoesNotExist:
            return Response({'error': 'Verification record not yet created for this delivery.'}, status=status.HTTP_404_NOT_FOUND)

        evidence = assignment.evidence_records.all()
        audit_logs = assignment.audit_logs.all()

        return Response({
            'verification': DeliveryVerificationSerializer(verification, context={'request': request}).data,
            'evidence': DeliveryEvidenceSerializer(evidence, many=True).data,
            'audit_logs': DeliveryAuditLogSerializer(audit_logs, many=True).data,
        }, status=status.HTTP_200_OK)


class AuditVerificationsListView(generics.ListAPIView):
    """
    GET /api/pickups/verifications/audit/
    Admin endpoint to view and inspect all delivery verifications, photographic evidence, and audit logs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(request.user, 'role', '') == UserRole.ADMIN):
            return Response({'error': 'Administrator access required.'}, status=status.HTTP_403_FORBIDDEN)

        verifications = DeliveryVerification.objects.all().order_by('-created_at')
        search = request.query_params.get('search')
        filter_status = request.query_params.get('status')

        if filter_status:
            verifications = verifications.filter(verification_status=filter_status)

        if search:
            verifications = verifications.filter(
                models.Q(donation__title__icontains=search) |
                models.Q(ngo__name__icontains=search) |
                models.Q(volunteer__username__icontains=search) |
                models.Q(donor__username__icontains=search)
            )

        data = DeliveryVerificationSerializer(verifications, many=True, context={'request': request}).data
        return Response({'results': data, 'count': len(data)}, status=status.HTTP_200_OK)
