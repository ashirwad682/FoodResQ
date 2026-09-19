from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
)

app_name = 'notifications'

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<str:pk>/read/', MarkNotificationReadView.as_view(), name='mark_read'),
    path('mark-all-read/', MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
]
