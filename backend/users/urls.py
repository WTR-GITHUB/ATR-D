# backend/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, me, CustomTokenObtainPairView, CustomTokenRefreshView, logout_view, user_settings, student_details, validate_auth, debug_role

# Router konfigūracija - registruoja vartotojų viewset'us
router = DefaultRouter()
router.register('users', UserViewSet)

# URL patterns - apibrėžia vartotojų API endpoint'us
urlpatterns = [
    # Router URL'ai - vartotojų CRUD endpoint'ai
    path('', include(router.urls)),
    
    # Autentifikacijos endpoint'ai
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),  # SEC-001: Custom refresh view
    path('logout/', logout_view, name='logout'),  # SEC-001: Logout endpoint
    # ROLE SWITCHING TOKEN LOGIC: Pašalintas switch_role endpoint
    # Nereikalingas - role switching vyksta tik frontend'e
    path('auth/validate/', validate_auth, name='validate_auth'),  # SEC-001: Auth validation endpoint
    path('debug/role/', debug_role, name='debug_role'),  # SEC-011: Debug role endpoint
    path('me/', me, name='me'),
    path('settings/', user_settings, name='user_settings'),
    
    # Studento detalių endpoint'as
    path('students/<int:student_id>/', student_details, name='student_details'),
] 