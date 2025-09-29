# /var/www/ATR-D/backend/users/backends.py
# PURPOSE: Django authentication backend for JWT tokens
# UPDATES: Created to support JWT authentication in Django middleware

from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings

User = get_user_model()


class JWTAuthenticationBackend(BaseBackend):
    """
    Django authentication backend that authenticates users via JWT tokens from cookies
    This allows Django's built-in AuthenticationMiddleware to work with JWT tokens
    """
    
    def authenticate(self, request, **kwargs):
        """
        Authenticate user using JWT token from cookie
        Returns User object for Django authentication system
        """
        if not request:
            return None
            
        # Get JWT token from cookie
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return None
            
        try:
            # Validate JWT token
            token = AccessToken(access_token)
            user_id = token.get('user_id')
            
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    # Store token in user object for later use
                    user._jwt_token = token
                    return user
                except User.DoesNotExist:
                    return None
                    
        except (InvalidToken, TokenError):
            return None
            
        return None
    
    def get_user(self, user_id):
        """
        Get user by ID (required by Django authentication backend)
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
