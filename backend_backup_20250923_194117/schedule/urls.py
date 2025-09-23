# backend/schedule/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PeriodViewSet, ClassroomViewSet, GlobalScheduleViewSet

# Router konfigūracija - registruoja visus schedule viewset'us
router = DefaultRouter()

# Tvarkaraščio endpoint'ai
router.register('periods', PeriodViewSet)
router.register('classrooms', ClassroomViewSet)
router.register('schedules', GlobalScheduleViewSet, basename='schedule')

# URL patterns - apibrėžia visus Schedule API endpoint'us
urlpatterns = [
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
] 