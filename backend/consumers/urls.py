from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserViewSet,
    StudentParentViewSet,
    StudentCuratorViewSet,
    StudentSubjectLevelViewSet,
    MentorSubjectViewSet,
    me
)

router = DefaultRouter()
router.register('users', UserViewSet)
router.register('student-parents', StudentParentViewSet)
router.register('student-curators', StudentCuratorViewSet)
router.register('student-subject-levels', StudentSubjectLevelViewSet)
router.register('mentor-subjects', MentorSubjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
] 