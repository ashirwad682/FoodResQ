from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from . import views
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path('', views.home, name='home'),
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

if settings.MEDIA_URL:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # Ensure media files (including photo evidence) are always served in production when DEBUG=False
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
