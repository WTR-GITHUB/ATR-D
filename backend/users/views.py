# backend/users/views.py
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer, UserSettingsSerializer

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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        """
        Slaptažodžio keitimo endpoint'as
        CHANGE: Pridėtas pk parametras ir saugumo patikra, kad vartotojas keistų tik savo slaptažodį
        CHANGE: Pašalinti debug console log'ai
        """
        # Saugumo patikra - vartotojas gali keisti tik savo slaptažodį
        if str(pk) != str(request.user.id):
            return Response({
                'success': False,
                'message': 'Galite keisti tik savo slaptažodį'
            }, status=403)
        
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Slaptažodis sėkmingai pakeistas!'
            })
        return Response({
            'success': False,
            'message': 'Klaida keičiant slaptažodį',
            'errors': serializer.errors
        }, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    """
    Vartotojo nustatymų endpoint'as - leidžia išsaugoti numatytąją rolę
    """
    serializer = UserSettingsSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'success': True,
            'message': 'Nustatymai sėkmingai išsaugoti!',
            'default_role': user.default_role
        })
    return Response({
        'success': False,
        'message': 'Klaida išsaugojant nustatymus',
        'errors': serializer.errors
    }, status=400)
