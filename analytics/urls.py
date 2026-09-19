from django.urls import path
from .views import (
    PlatformAnalyticsDashboardView,
    LeaderboardView,
    UserImpactView,
    AdminDashboardMetricsView,
)

app_name = 'analytics'

urlpatterns = [
    path('dashboard/', PlatformAnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('leaderboard/', LeaderboardView.as_view(), name='analytics_leaderboard'),
    path('my-impact/', UserImpactView.as_view(), name='my_impact'),
    path('admin/', AdminDashboardMetricsView.as_view(), name='admin_metrics'),
]
