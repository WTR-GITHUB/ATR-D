# /backend/crm/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    StudentParentViewSet,
    StudentCuratorViewSet,
    StudentSubjectLevelViewSet,
    MentorSubjectViewSet
)

# Router konfigūracija - registruoja visus viewset'us
router = DefaultRouter()

# Santykių endpoint'ai
router.register('student-parents', StudentParentViewSet)
router.register('student-curators', StudentCuratorViewSet)
router.register('student-subject-levels', StudentSubjectLevelViewSet)
router.register('mentor-subjects', MentorSubjectViewSet)

# URL patterns - apibrėžia visus API endpoint'us
urlpatterns = [
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
    

] 