# /home/master/DIENYNAS/backend/users/authentication.py
# SEC-001: Custom cookie-based JWT authentication
# PURPOSE: Handle JWT authentication via httpOnly cookies
# UPDATES: Created for SEC-001 cookie-based authentication

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.conf import settings


class JWTCookieAuthentication(JWTAuthentication):
    """
    SEC-001: Custom JWT authentication that reads tokens from httpOnly cookies
    """
    
    def authenticate(self, request):
        """
        SEC-001: Override authenticate to read token from cookie instead of header
        """
        # Try to get token from cookie first
        access_token = request.COOKIES.get(settings.SIMPLE_JWT['AUTH_COOKIE_NAME'])
        
        if access_token:
            try:
                # Validate the token
                validated_token = self.get_validated_token(access_token)
                return self.get_user(validated_token), validated_token
            except (InvalidToken, TokenError):
                # If cookie token is invalid, try header as fallback
                pass
        
        # Fallback to header-based authentication
        return super().authenticate(request)
    
    def get_validated_token(self, raw_token):
        """
        SEC-001: Validate token from cookie
        """
        for AuthToken in self.get_auth_token_classes():
            try:
                return AuthToken(raw_token)
            except TokenError:
                continue
        
        raise InvalidToken()
    
    def get_auth_token_classes(self):
        """
        SEC-001: Get authentication token classes
        """
        return [AccessToken]
