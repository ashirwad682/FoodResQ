from django.urls import path
from .views import (
    MatchedNGOsView,
    MatchedVolunteersView,
    AutoMatchAlertView,
)

app_name = 'matching'

urlpatterns = [
    path('donations/<str:donation_id>/ngos/', MatchedNGOsView.as_view(), name='matched_ngos'),
    path('donations/<str:donation_id>/volunteers/', MatchedVolunteersView.as_view(), name='matched_volunteers'),
    path('donations/<str:donation_id>/auto-match/', AutoMatchAlertView.as_view(), name='auto_match_alert'),
]
