# /backend/users/oauth_views.py
"""
Custom OAuth views for handling Google OAuth integration.

Purpose: Bridge between django-allauth session authentication and JWT tokens
Updates: Created custom OAuth callback to generate JWT tokens
Notes: Converts OAuth session to JWT tokens for frontend compatibility
"""

from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView
import logging

logger = logging.getLogger(__name__)

User = get_user_model()


class CustomGoogleOAuth2Adapter(GoogleOAuth2Adapter):
    """
    Custom Google OAuth2 adapter that overrides the callback URL.
    """
    def get_callback_url(self, request, app):
        """
        Override callback URL to use our custom endpoint.
        """
        return '/api/users/oauth/google/callback/'


class CustomGoogleOAuth2LoginView(OAuth2LoginView):
    """
    Custom Google OAuth2 login view that uses our custom adapter.
    """
    adapter_class = CustomGoogleOAuth2Adapter


@method_decorator(csrf_exempt, name='dispatch')
class GoogleOAuthCallbackView(View):
    """
    Custom Google OAuth callback view.
    
    This view handles the OAuth callback, generates JWT tokens,
    and redirects to frontend with tokens.
    """
    
    def get(self, request):
        """
        Handle GET request from Google OAuth callback.
        
        If user is authenticated via OAuth, generate JWT tokens
        and redirect to frontend with tokens.
        """
        logger.info(f"🔐 OAUTH_CALLBACK: Processing OAuth callback")
        
        # Check if user is authenticated via OAuth
        if not request.user.is_authenticated:
            logger.warning("🔐 OAUTH_CALLBACK: User not authenticated")
            return redirect('/auth/login?error=oauth_failed')
        
        user = request.user
        logger.info(f"🔐 OAUTH_CALLBACK: User authenticated: {user.email}")
        
        try:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            logger.info(f"🔐 OAUTH_CALLBACK: JWT tokens generated for {user.email}")
            
            # Create response with cookies (same as traditional login)
            from django.conf import settings
            from django.http import HttpResponseRedirect
            
            frontend_url = settings.ACCOUNT_LOGIN_REDIRECT_URL
            response = HttpResponseRedirect(frontend_url)
            
            # Set access token cookie (same as CustomTokenObtainPairView)
            response.set_cookie(
                'access_token',
                access_token,
                max_age=settings.SIMPLE_JWT['AUTH_COOKIE_ACCESS_MAX_AGE'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None
            )
            
            # Set refresh token cookie (same as CustomTokenObtainPairView)
            response.set_cookie(
                'refresh_token',
                refresh_token,
                max_age=settings.SIMPLE_JWT['AUTH_COOKIE_REFRESH_MAX_AGE'].total_seconds(),
                secure=settings.SIMPLE_JWT['AUTH_COOKIE_SECURE'],
                httponly=settings.SIMPLE_JWT['AUTH_COOKIE_HTTP_ONLY'],
                samesite=settings.SIMPLE_JWT['AUTH_COOKIE_SAMESITE'],
                domain=settings.SIMPLE_JWT['AUTH_COOKIE_DOMAIN'] if not settings.DEBUG else None
            )
            
            logger.info(f"🔐 OAUTH_CALLBACK: Cookies set, redirecting to frontend: {frontend_url}")
            return response
            
        except Exception as e:
            logger.error(f"🔐 OAUTH_CALLBACK: Error generating tokens: {e}")
            return redirect('/auth/login?error=token_generation_failed')


def oauth_success_view(request):
    """
    Simple success view for OAuth completion.
    
    This can be used as a fallback if the main callback fails.
    """
    if request.user.is_authenticated:
        return JsonResponse({
            'success': True,
            'message': 'OAuth login successful',
            'user': {
                'email': request.user.email,
                'name': f"{request.user.first_name} {request.user.last_name}",
                'roles': request.user.roles
            }
        })
    else:
        return JsonResponse({
            'success': False,
            'message': 'OAuth login failed'
        }, status=401)
