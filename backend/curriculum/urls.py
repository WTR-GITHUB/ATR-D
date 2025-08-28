# /backend/curriculum/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubjectViewSet, LevelViewSet, ObjectiveViewSet, ComponentViewSet,
    SkillViewSet, CompetencyViewSet, VirtueViewSet, CompetencyAtcheveViewSet, LessonViewSet
)

# Router konfigūracija - registruoja visus curriculum viewset'us
router = DefaultRouter()

# Pamokų komponentų endpoint'ai
router.register('subjects', SubjectViewSet)
router.register('levels', LevelViewSet)
router.register('objectives', ObjectiveViewSet)
router.register('components', ComponentViewSet)
router.register('skills', SkillViewSet)
router.register('competencies', CompetencyViewSet)
router.register('competency-atcheves', CompetencyAtcheveViewSet)
router.register('virtues', VirtueViewSet)
router.register('lessons', LessonViewSet, basename='lesson')

# URL patterns - apibrėžia visus Curriculum API endpoint'us
urlpatterns = [
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
] 