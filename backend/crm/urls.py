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
    GradeViewSet,
    SubjectViewSet,
    LevelViewSet,
    ObjectiveViewSet,
    ComponentViewSet,
    SkillViewSet,
    CompetencyViewSet,
    CompetencyAtcheveViewSet,
    VirtueViewSet,
    LessonViewSet,
    me
)

# Router konfigūracija - registruoja visus viewset'us
router = DefaultRouter()

# Vartotojų ir santykių endpoint'ai
router.register('users', UserViewSet)
router.register('student-parents', StudentParentViewSet)
router.register('student-curators', StudentCuratorViewSet)
router.register('student-subject-levels', StudentSubjectLevelViewSet)
router.register('mentor-subjects', MentorSubjectViewSet)
router.register('grades', GradeViewSet, basename='grade')

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

# URL patterns - apibrėžia visus API endpoint'us
urlpatterns = [
    # Router URL'ai - visi CRUD endpoint'ai
    path('', include(router.urls)),
    
    # Autentifikacijos endpoint'ai
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
] 