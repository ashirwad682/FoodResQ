from django.urls import path
from .views import (
    FoodDonationListCreateView,
    FoodDonationDetailView,
)

app_name = 'donations'

urlpatterns = [
    path('', FoodDonationListCreateView.as_view(), name='donation_list_create'),
    path('<str:pk>/', FoodDonationDetailView.as_view(), name='donation_detail'),
]
