# backend/users/views.py
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer

# Create your views here.

# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT token gavimo view - valdo prisijungimo procesą
    """
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Dabartinio vartotojo informacijos endpoint'as - grąžina prisijungusio vartotojo duomenis
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# User Views
class UserViewSet(viewsets.ModelViewSet):
    """
    Vartotojų valdymo viewset - valdo vartotojų CRUD operacijas
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # CHANGE: Pašalintas IsAdminUser permission, kad vartotojai galėtų pasiekti savo duomenis
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # CHANGE: Jei vartotojas yra admin/manager, grąžinti visus vartotojus
        # Jei ne, grąžinti tik savo duomenis
        if self.request.user.has_role('manager') or self.request.user.is_staff:
            queryset = User.objects.all()
            role = self.request.query_params.get('role', None)
            if role is not None:
                queryset = queryset.filter(roles__contains=[role])
            return queryset
        else:
            # Grąžinti tik savo duomenis
            return User.objects.filter(id=self.request.user.id)
