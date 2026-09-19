from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # OpenAPI 3 Schema & Interactive Swagger / ReDoc Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # FoodResQ Core API Modules
    path('api/auth/', include('accounts.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('api/donations/', include('donations.urls')),
    path('api/pickups/', include('pickups.urls')),
    path('api/volunteers/', include('volunteers.urls')),
    path('api/matching/', include('matching.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/', include('analytics.urls')),
]
