# /backend/core/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health_views import health_check, health_detailed

urlpatterns = [
    path('admin/', admin.site.urls),
    # Health check endpoints
    path('api/health/', health_check, name='health_check'),
    path('api/health/detailed/', health_detailed, name='health_detailed'),
    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/schedule/', include('schedule.urls')),
    path('api/curriculum/', include('curriculum.urls')),
    path('api/grades/', include('grades.urls')),
    path('api/plans/', include('plans.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
