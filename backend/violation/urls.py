# backend/violation/urls.py

# Violation management URL configuration for A-DIENYNAS system
# Defines API endpoints for violation CRUD operations, bulk actions, and statistics
# CHANGE: Created comprehensive URL patterns for violation system with all endpoints

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ViolationCategoryViewSet,
    ViolationRangeViewSet,
    ViolationViewSet,
    violation_stats,
    violation_category_stats
)

# Router konfigūracija - registruoja visus viewset'us
router = DefaultRouter()

# Pagrindiniai endpoint'ai
router.register('categories', ViolationCategoryViewSet)
router.register('ranges', ViolationRangeViewSet)
router.register('', ViolationViewSet, basename='violations')

# URL patterns - apibrėžia visus API endpoint'us
urlpatterns = [
    # Statistikos endpoint'ai PIRMA - kad neperdengtu router
    path('stats/', violation_stats, name='violation-stats'),
    path('category-stats/', violation_category_stats, name='violation-category-stats'),
    
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
]
