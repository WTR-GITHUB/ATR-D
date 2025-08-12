# backend/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserViewSet, me, CustomTokenObtainPairView

# Router konfigūracija - registruoja vartotojų viewset'us
router = DefaultRouter()
router.register('users', UserViewSet)

# URL patterns - apibrėžia vartotojų API endpoint'us
urlpatterns = [
    # Router URL'ai - vartotojų CRUD endpoint'ai
    path('', include(router.urls)),
    
    # Autentifikacijos endpoint'ai
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
] 