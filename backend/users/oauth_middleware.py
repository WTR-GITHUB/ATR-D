# /backend/users/oauth_middleware.py
"""
OAuth callback middleware for JWT token generation.

Purpose: Intercept OAuth callbacks and generate JWT tokens
Updates: Created middleware to bridge OAuth session and JWT tokens
Notes: Converts OAuth session to JWT cookies for frontend compatibility
"""

from django.http import HttpResponseRedirect
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class OAuthCallbackMiddleware:
    """
    Middleware that intercepts OAuth callbacks and generates JWT tokens.
    
    This middleware catches successful OAuth callbacks and adds JWT cookies
    to the response, making the user authenticated for the frontend.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Check if this is a successful OAuth callback
        if self._is_oauth_callback(request, response):
            logger.info(f"🔐 OAUTH_MIDDLEWARE: Intercepting OAuth callback for {request.user.email}")
            
            try:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(request.user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                logger.info(f"🔐 OAUTH_MIDDLEWARE: JWT tokens generated for {request.user.email}")
                
                # Set JWT cookies (same as traditional login)
                response.set_cookie(
                    'access_token',
                    access_token,
                    max_age=settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS_MAX_AGE'].total_seconds(),
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None
                )
                
                response.set_cookie(
                    'refresh_token',
                    refresh_token,
                    max_age=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH_MAX_AGE'].total_seconds(),
                    secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                    httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                    samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                    domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None
                )
                
                logger.info(f"🔐 OAUTH_MIDDLEWARE: JWT cookies set for {request.user.email}")
                
            except Exception as e:
                logger.error(f"🔐 OAUTH_MIDDLEWARE: Error generating JWT tokens: {e}")
        
        return response
    
    def _is_oauth_callback(self, request, response):
        """
        Check if this is a successful OAuth callback.
        
        Returns True if:
        1. User is authenticated via OAuth
        2. Response is a redirect to frontend
        3. URL matches OAuth callback pattern
        4. Request comes from OAuth callback path
        """
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # Check if this is a redirect response
        if not isinstance(response, HttpResponseRedirect):
            return False
        
        # SECURITY: Only process OAuth callback paths
        if not request.path.startswith('/accounts/google/login/callback'):
            return False
        
        # Check if redirecting to frontend
        redirect_url = response.get('Location', '')
        frontend_url = settings.ACCOUNT_LOGIN_REDIRECT_URL
        
        # SECURITY: Validate redirect URL to prevent open redirect
        if not redirect_url.startswith(frontend_url):
            logger.warning(f"🔐 OAUTH_MIDDLEWARE: Suspicious redirect URL: {redirect_url}")
            return False
        
        # Check if redirecting to our frontend URL
        if redirect_url.startswith(frontend_url):
            logger.info(f"🔐 OAUTH_MIDDLEWARE: OAuth callback detected - redirecting to {redirect_url}")
            return True
        
        return False
