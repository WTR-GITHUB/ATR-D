# backend/grades/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GradeViewSet

# Router konfigūracija - registruoja visus grades viewset'us
router = DefaultRouter()

# Pažymių endpoint'ai
router.register('grades', GradeViewSet, basename='grade')

# URL patterns - apibrėžia visus Grades API endpoint'us
urlpatterns = [
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
] 