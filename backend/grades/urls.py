# backend/grades/urls.py

# Grades aplikacijos URL patterns - API endpoint'ų konfigūracija
# CHANGE: Atnaujintas su naujais API endpoint'ais AchievementLevel ir Grade modeliams

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AchievementLevelViewSet, GradeViewSet

# Sukuriame router'į API endpoint'ams
router = DefaultRouter()
router.register(r'achievement-levels', AchievementLevelViewSet, basename='achievement-levels')
router.register(r'grades', GradeViewSet, basename='grades')

app_name = 'grades'

urlpatterns = [
    # Router'io URL patterns
    path('', include(router.urls)),
    
    # Papildomi custom endpoint'ai
    path('calculate-level/<int:percentage>/', 
         GradeViewSet.as_view({'post': 'calculate_level'}), 
         name='calculate-level'),
    
    path('student-summary/', 
         GradeViewSet.as_view({'get': 'student_summary'}), 
         name='student-summary'),
    
    path('lesson-summary/', 
         GradeViewSet.as_view({'get': 'lesson_summary'}), 
         name='lesson-summary'),
    
    path('recalculate-all/', 
         GradeViewSet.as_view({'post': 'recalculate_all'}), 
         name='recalculate-all'),
] 