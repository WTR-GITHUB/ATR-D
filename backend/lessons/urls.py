from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubjectViewSet, LevelViewSet, TopicViewSet, ObjectiveViewSet,
    ComponentViewSet, SkillViewSet, CompetencyViewSet, VirtueViewSet,
    FocusViewSet, LessonViewSet, GradeViewSet
)

router = DefaultRouter()
router.register('subjects', SubjectViewSet)
router.register('levels', LevelViewSet)
router.register('topics', TopicViewSet)
router.register('objectives', ObjectiveViewSet)
router.register('components', ComponentViewSet)
router.register('skills', SkillViewSet)
router.register('competencies', CompetencyViewSet)
router.register('virtues', VirtueViewSet)
router.register('focus', FocusViewSet)
router.register('lessons', LessonViewSet, basename='lesson')
router.register('grades', GradeViewSet, basename='grade')

urlpatterns = [
    path('', include(router.urls)),
] 