from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    List in-app notifications for authenticated user. Supports ?unread_only=true
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(recipient=user).order_by('-created_at')
        unread = self.request.query_params.get('unread_only')
        if unread and unread.lower() in ['true', '1']:
            queryset = queryset.filter(is_read=False)
        return queryset


class MarkNotificationReadView(APIView):
    """
    PATCH /api/notifications/{id}/read/
    Mark a single notification as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Mark Notification as Read",
        request=None,
        responses={200: NotificationSerializer}
    )
    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(pk=pk, recipient=request.user)
            notif.is_read = True
            notif.save()
            return Response(NotificationSerializer(notif).data, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)


class MarkAllNotificationsReadView(APIView):
    """
    POST /api/notifications/mark-all-read/
    Mark all notifications for authenticated user as read.
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Mark All Notifications as Read",
        request=None,
        responses={200: OpenApiResponse(description="All notifications marked read.")}
    )
    def post(self, request):
        updated_count = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({
            'message': 'All notifications marked as read.',
            'count': updated_count
        }, status=status.HTTP_200_OK)
