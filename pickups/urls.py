from django.urls import path
from .views import (
    CreatePickupRequestView,
    ListPickupRequestsView,
    ApprovePickupRequestView,
    RejectPickupRequestView,
    ListAvailableAssignmentsView,
    AcceptAssignmentView,
    CollectFoodView,
    DeliverFoodView,
    ConfirmDeliveryView,
    DonationStatusHistoryView,
)

app_name = 'pickups'

urlpatterns = [
    path('request/', CreatePickupRequestView.as_view(), name='create_request'),
    path('requests/', ListPickupRequestsView.as_view(), name='list_requests'),
    path('requests/<str:pk>/approve/', ApprovePickupRequestView.as_view(), name='approve_request'),
    path('requests/<str:pk>/reject/', RejectPickupRequestView.as_view(), name='reject_request'),
    
    path('assignments/', ListAvailableAssignmentsView.as_view(), name='list_assignments'),
    path('assignments/<str:pk>/accept/', AcceptAssignmentView.as_view(), name='accept_assignment'),
    path('assignments/<str:pk>/collect/', CollectFoodView.as_view(), name='collect_food'),
    path('assignments/<str:pk>/deliver/', DeliverFoodView.as_view(), name='deliver_food'),
    path('assignments/<str:pk>/confirm/', ConfirmDeliveryView.as_view(), name='confirm_delivery'),
    
    path('history/<str:donation_id>/', DonationStatusHistoryView.as_view(), name='donation_history'),
]
