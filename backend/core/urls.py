
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/schedule/', include('schedule.urls')),
    path('api/curriculum/', include('curriculum.urls')),
    path('api/grades/', include('grades.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
