from django.urls import path
from .views import (
    VolunteerListView,
    VolunteerStatusUpdateView,
    VolunteerActiveAssignmentView,
)

app_name = 'volunteers'

urlpatterns = [
    path('', VolunteerListView.as_view(), name='volunteer_list'),
    path('status/', VolunteerStatusUpdateView.as_view(), name='volunteer_status_update'),
    path('active-assignment/', VolunteerActiveAssignmentView.as_view(), name='volunteer_active_assignment'),
]
