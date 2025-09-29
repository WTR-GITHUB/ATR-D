# backend/users/serializers.py

# User management serializers for A-DIENYNAS system
# Defines serializers for user registration, authentication, and profile management
# CHANGE: Atkurtas teisingas CustomTokenObtainPairSerializer, kuris paveldi iš TokenObtainPairSerializer

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.http import HttpResponse
from django.conf import settings
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT token serializeris - sukuria prisijungimo tokenus su papildoma informacija
    SEC-001: Pridėtas cookie-based authentication palaikymas
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['current_role'] = user.get_default_role()  # Initially = default_role
        token['full_name'] = f"{user.first_name} {user.last_name}"
        # ROLE SWITCHING TOKEN LOGIC: Token'e tik current_role
        # roles ir default_role pašalinti - tikrinama iš DB
        return token
    
    @classmethod
    def generate_token_with_current_role(cls, user, current_role):
        """
        Generate new token with specified current_role
        Used for role switching
        """
        token = super().get_token(user)
        token['email'] = user.email
        token['current_role'] = current_role
        token['full_name'] = f"{user.first_name} {user.last_name}"
        return token
    
    def validate(self, attrs):
        """
        SEC-001: Override validate method to set cookies
        """
        data = super().validate(attrs)
        
        # Get tokens
        refresh = self.get_token(self.user)
        access = refresh.access_token
        
        # Set cookies in response
        response = self.context.get('response')
        if response:
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
        
        return data

class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for CRUD operations
    FIX: Pridėtas current_role laukas iš middleware
    """
    current_role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'roles', 'default_role', 'current_role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
    
    def get_current_role(self, obj):
        """
        FIX: Gauti current_role iš request middleware
        Jei middleware nėra, naudoti default_role
        """
        request = self.context.get('request')
        if request:
            return getattr(request, 'current_role', obj.default_role)
        return obj.default_role

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change functionality
    """
    old_password = serializers.CharField(required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Neteisingas senas slaptažodis.')
        return value

    def validate_new_password(self, value):
        validate_password(value, self.context['request'].user)
        return value

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user

class UserSettingsSerializer(serializers.Serializer):
    """
    Serializer for user settings (default role)
    """
    default_role = serializers.CharField(required=True)

    def validate_default_role(self, value):
        # DRF Request objektas turi .user atributą
        user = self.context['request'].user
        if value not in user.roles:
            raise serializers.ValidationError('Negalite pasirinkti rolės, kurios neturite.')
        return value

    def save(self):
        # DRF Request objektas turi .user atributą
        user = self.context['request'].user
        user.default_role = self.validated_data['default_role']
        user.save()
        return user 