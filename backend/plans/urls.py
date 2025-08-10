from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sequences', views.LessonSequenceViewSet)
router.register(r'sequence-items', views.LessonSequenceItemViewSet)
router.register(r'imu-plans', views.IMUPlanViewSet)

app_name = 'plans'

urlpatterns = [
    path('', include(router.urls)),
]
