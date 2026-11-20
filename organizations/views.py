from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Organization
from .serializers import OrganizationSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse
from accounts.permissions import IsAdminUser, IsNGO


class OrganizationListView(generics.ListCreateAPIView):
    """
    GET /api/organizations/
    List organizations. Supports query params: ?verified=true/false, ?search=name
    """
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Organization.objects.all().order_by('-created_at')
        verified_param = self.request.query_params.get('verified')
        if verified_param is not None:
            is_ver = verified_param.lower() in ['true', '1']
            queryset = queryset.filter(is_verified=is_ver)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class OrganizationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET /api/organizations/{id}/
    PATCH /api/organizations/{id}/
    Retrieve or update organization details.
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def check_object_permissions(self, request, obj):
        super().check_object_permissions(request, obj)
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.user != request.user and not (request.user.is_staff or request.user.role == 'ADMIN'):
                self.permission_denied(
                    request, message="You do not have permission to modify this organization."
                )


class VerifyOrganizationView(APIView):
    """
    POST /api/organizations/{id}/verify/
    Platform Admin verifies or toggles approval of an NGO.
    """
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="Verify Organization",
        description="Admin-only endpoint to verify or toggle verification status of an NGO.",
        request=None,
        responses={200: OpenApiResponse(description="Organization verification toggled.")}
    )
    def post(self, request, pk):
        try:
            org = Organization.objects.get(pk=pk)
            action = request.data.get('action')
            if action == 'approve':
                org.is_verified = True
            elif action == 'reject':
                org.is_verified = False
            else:
                org.is_verified = not org.is_verified
            org.save()

            from notifications.models import Notification, NotificationType
            Notification.objects.create(
                recipient=org.user,
                title='Organization Verified! 🎉' if org.is_verified else 'Verification Status Update',
                message=(
                    f"Congratulations! '{org.name}' has been verified by the FoodResQ safety committee. You can now claim surplus food."
                    if org.is_verified else
                    f"The verification for '{org.name}' has been revoked or declined by administrators."
                ),
                notification_type=NotificationType.REQUEST_APPROVED if org.is_verified else NotificationType.REQUEST_REJECTED
            )

            return Response({
                'message': f"Organization '{org.name}' verification set to {org.is_verified}",
                'is_verified': org.is_verified
            }, status=status.HTTP_200_OK)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization not found'}, status=status.HTTP_404_NOT_FOUND)
