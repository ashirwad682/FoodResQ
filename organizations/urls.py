from django.urls import path
from .views import (
    OrganizationListView,
    OrganizationDetailView,
    VerifyOrganizationView,
)

app_name = 'organizations'

urlpatterns = [
    path('', OrganizationListView.as_view(), name='organization_list'),
    path('<str:pk>/', OrganizationDetailView.as_view(), name='organization_detail'),
    path('<str:pk>/verify/', VerifyOrganizationView.as_view(), name='organization_verify'),
]
