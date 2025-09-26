# backend/users/views.py
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.http import HttpResponse
import logging
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer, UserSettingsSerializer
from rest_framework_simplejwt.tokens import RefreshToken

# Create logger for this module
logger = logging.getLogger(__name__)

# Create your views here.

# Authentication Views
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT token gavimo view - valdo prisijungimo procesą
    SEC-001: Pridėtas cookie-based authentication palaikymas
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        """
        SEC-001: Override post method to handle cookie setting
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create response with tokens (both in response body and cookies)
        response = Response(serializer.validated_data, status=200)
        
        # Pass response to serializer for cookie setting
        serializer.context['response'] = response
        
        # Get tokens and set cookies manually
        refresh = serializer.get_token(serializer.user)
        access = refresh.access_token
        
        # Set access token cookie
        response.set_cookie(
            'access_token',
            str(access),
            max_age=settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS_MAX_AGE'].total_seconds(),
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None  # No domain restriction in development
        )
        
        # Set refresh token cookie
        response.set_cookie(
            'refresh_token',
            str(refresh),
            max_age=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH_MAX_AGE'].total_seconds(),
            secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
            httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
            samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
            domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None  # No domain restriction in development
        )
        
        return response

class CustomTokenRefreshView(TokenRefreshView):
    """
    SEC-001: Custom token refresh view with cookie support
    """
    def post(self, request, *args, **kwargs):
        """
        Handle token refresh with cookie support
        """
        # Get refresh token from cookie or request body
        refresh_token = request.COOKIES.get('refresh_token') or request.data.get('refresh')
        
        if not refresh_token:
            return Response({'error': 'Refresh token not found'}, status=400)
        
        # Create new request data with refresh token
        request.data['refresh'] = refresh_token
        
        # Call parent method
        response = super().post(request, *args, **kwargs)
        
        # Set new access token cookie
        if response.status_code == 200 and 'access' in response.data:
            response.set_cookie(
                'access_token',
                response.data['access'],
                max_age=settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS_MAX_AGE'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None  # No domain restriction in development
            )
        
        return response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    SEC-001: Logout view that clears cookies
    """
    response = HttpResponse({'message': 'Successfully logged out'})
    
    # Clear authentication cookies
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    
    return response

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
        # SEC-011: Naudojame server-side role validation vietoj manipuliuojamo header
        current_role = getattr(self.request, 'current_role', None)
        if not current_role:
            current_role = getattr(self.request.user, 'default_role', None)
        
        # Jei vartotojas yra admin/manager/mentor/curator, grąžinti visus vartotojus
        # Jei ne, grąžinti tik savo duomenis
        if current_role in ['manager', 'mentor', 'curator'] or self.request.user.is_staff:
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_details(request, student_id):
    """
    Studento detalių endpoint'as su role-based prieigos kontrole
    CHANGE: Pridėtas studento detalių endpoint'as su saugumo apsauga
    """
    from crm.models import StudentCurator
    
    # SEC-011: Naudojame server-side role validation vietoj manipuliuojamo header
    current_role = getattr(request, 'current_role', None)
    if not current_role:
        current_role = getattr(request.user, 'default_role', None)
    
    # Server-side role-based access control
    if current_role not in ['curator', 'manager']:
        return Response({
            'error': 'Prieiga uždrausta. Tik kuratoriai ir valdytojai gali peržiūrėti studento duomenis.'
        }, status=403)
    
    try:
        # Gauname studentą
        student = User.objects.get(id=student_id)
        
        # Patikriname ar vartotojas turi student rolę
        if not student.has_role('student'):
            return Response({
                'error': 'Nurodytas vartotojas nėra studentas'
            }, status=404)
        
        # Curator gali matyti tik savo priskirtus studentus
        if current_role == 'curator':
            if not StudentCurator.objects.filter(curator=request.user, student=student).exists():
                return Response({
                    'error': 'Prieiga uždrausta. Galite peržiūrėti tik savo priskirtų studentų duomenis.'
                }, status=403)
        
        # Grąžiname studento duomenis
        serializer = UserSerializer(student)
        return Response(serializer.data)
        
    except User.DoesNotExist:
        return Response({
            'error': 'Studentas nerastas'
        }, status=404)
    except Exception as e:
        return Response({
            'error': f'Klaida gaunant studento duomenis: {str(e)}'
        }, status=500)


# ROLE SWITCHING TOKEN LOGIC: Pašalintas switch_role endpoint
# Nereikalingas - role switching vyksta tik frontend'e
# Backend'as tikrina ar role egzistuoja token'e per RoleValidationMiddleware


@api_view(['GET'])
def validate_auth(request):
    """
    SEC-001: Authentication validation endpoint for AuthManager
    Fast endpoint to check if user is authenticated via cookies
    Used by frontend AuthManager for instant authentication checks
    """
    try:
        # Check if user is authenticated via JWT middleware
        if request.user.is_authenticated:
            # SEC-011: Get current role from middleware
            current_role = getattr(request, 'current_role', None)
            if not current_role:
                current_role = request.user.default_role
            
            # DEBUG: Log validation request
            logger.info(f"🔐 VALIDATE DEBUG: User {request.user.id} validation request")
            logger.info(f"🔐 VALIDATE DEBUG: Current role from middleware: {current_role}")
            logger.info(f"🔐 VALIDATE DEBUG: User default role: {request.user.default_role}")
            logger.info(f"🔐 VALIDATE DEBUG: User roles: {request.user.roles}")
            
            return Response({
                'valid': True,
                'user_id': request.user.id,
                'email': request.user.email,
                'roles': request.user.roles,
                'default_role': request.user.default_role,
                'current_role': current_role,  # SEC-011: Add current role from middleware
            }, status=200)
        else:
            return Response({
                'valid': False,
                'error': 'User not authenticated'
            }, status=401)
            
    except Exception as e:
        return Response({
            'valid': False,
            'error': f'Validation error: {str(e)}'
        }, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_role(request):
    """
    SEC-011: Debug endpoint to check role validation
    """
    try:
        current_role = getattr(request, 'current_role', None)
        
        return Response({
            'user_id': request.user.id,
            'user_roles': request.user.roles,
            'user_default_role': request.user.default_role,
            'middleware_current_role': current_role,
            'has_current_role_attr': hasattr(request, 'current_role'),
            'request_attributes': [attr for attr in dir(request) if 'role' in attr.lower()],
        }, status=200)
        
    except Exception as e:
        return Response({
            'error': f'Debug error: {str(e)}'
        }, status=500)
