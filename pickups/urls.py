from django.urls import path
from .views import (
    CreatePickupRequestView,
    ListPickupRequestsView,
    ApprovePickupRequestView,
    RejectPickupRequestView,
    CancelPickupRequestView,
    ListAvailableAssignmentsView,
    AcceptAssignmentView,
    CollectFoodView,
    DeliverFoodView,
    ConfirmDeliveryView,
    DonationStatusHistoryView,
    UploadEvidencePhotoView,
    UpdateAssignmentStatusView,
    SubmitCollectionEvidenceView,
    GenerateHandoverOtpView,
    SubmitHandoverEvidenceView,
    VerifyHandoverOtpView,
    GetVerificationDetailsView,
    AuditVerificationsListView,
)

app_name = 'pickups'

urlpatterns = [
    path('request/', CreatePickupRequestView.as_view(), name='create_request'),
    path('requests/', ListPickupRequestsView.as_view(), name='list_requests'),
    path('requests/<str:pk>/approve/', ApprovePickupRequestView.as_view(), name='approve_request'),
    path('requests/<str:pk>/reject/', RejectPickupRequestView.as_view(), name='reject_request'),
    path('requests/<str:pk>/cancel/', CancelPickupRequestView.as_view(), name='cancel_request'),
    
    path('assignments/', ListAvailableAssignmentsView.as_view(), name='list_assignments'),
    path('assignments/<str:pk>/accept/', AcceptAssignmentView.as_view(), name='accept_assignment'),
    path('assignments/<str:pk>/collect/', CollectFoodView.as_view(), name='collect_food'),
    path('assignments/<str:pk>/deliver/', DeliverFoodView.as_view(), name='deliver_food'),
    path('assignments/<str:pk>/confirm/', ConfirmDeliveryView.as_view(), name='confirm_delivery'),
    
    # Verification & Chain of Custody Endpoints
    path('upload-photo/', UploadEvidencePhotoView.as_view(), name='upload_photo'),
    path('assignments/<str:pk>/status/', UpdateAssignmentStatusView.as_view(), name='update_assignment_status'),
    path('assignments/<str:pk>/collection-evidence/', SubmitCollectionEvidenceView.as_view(), name='submit_collection_evidence'),
    path('assignments/<str:pk>/generate-otp/', GenerateHandoverOtpView.as_view(), name='generate_handover_otp'),
    path('assignments/<str:pk>/handover-evidence/', SubmitHandoverEvidenceView.as_view(), name='submit_handover_evidence'),
    path('assignments/<str:pk>/verify-otp/', VerifyHandoverOtpView.as_view(), name='verify_handover_otp'),
    path('assignments/<str:pk>/verification/', GetVerificationDetailsView.as_view(), name='get_verification_details'),
    path('verifications/audit/', AuditVerificationsListView.as_view(), name='audit_verifications_list'),
    
    path('history/<str:donation_id>/', DonationStatusHistoryView.as_view(), name='donation_history'),
]
