from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from .health_views import health_check, health_detailed

urlpatterns = [
    path("admin/", admin.site.urls),
    # Health check endpoints
    path("api/health/", health_check, name="health_check"),
    path("api/health/detailed/", health_detailed, name="health_detailed"),
    # API endpoints
    path("api/users/", include("users.urls")),
    path("api/crm/", include("crm.urls")),
    path("api/schedule/", include("schedule.urls")),
    path("api/curriculum/", include("curriculum.urls")),
    path("api/grades/", include("grades.urls")),
    path("api/plans/", include("plans.urls")),
    path("api/violations/", include("violation.urls")),
    # django-allauth URLs
    path("accounts/", include("allauth.urls")),
]

# Add static files serving
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # For production, serve static files
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)