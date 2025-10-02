# /var/www/ATR-D/backend/users/auth_logging_middleware.py
# Authentication Logging Middleware for A-DIENYNAS
# PURPOSE: Specialized logging for authentication events
# UPDATES: Created authentication-specific logging middleware

import logging
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class AuthLoggingMiddleware(MiddlewareMixin):
    """
    Specialized middleware for logging authentication events
    including login attempts, role switches, and security events.
    """
    
    def process_request(self, request):
        """Log authentication-related requests"""
        # Log OAuth requests
        if '/accounts/google/login/' in request.path:
            logger.info(
                f"🔐 OAUTH_LOGIN: Google OAuth login initiated | "
                f"IP: {self._get_client_ip(request)} | "
                f"Referrer: {request.META.get('HTTP_REFERER', 'N/A')} | "
                f"User-Agent: {request.META.get('HTTP_USER_AGENT', 'N/A')[:50]}"
            )
        
        # Log API authentication requests
        elif request.path.startswith('/api/users/token/'):
            logger.info(
                f"🔐 API_AUTH: Token request ({request.method}) | "
                f"IP: {self._get_client_ip(request)} | "
                f"Path: {request.path}"
            )
        
        # Log role switching requests
        elif '/switch-role/' in request.path:
            user_info = self._get_user_info(request)
            logger.info(
                f"🔄 ROLE_SWITCH: Role switch request | "
                f"User: {user_info} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        # Log logout requests
        elif '/logout/' in request.path:
            user_info = self._get_user_info(request)
            logger.info(
                f"🚪 LOGOUT: Logout request | "
                f"User: {user_info} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        return None
    
    def process_response(self, request, response):
        """Log authentication-related responses"""
        # Log OAuth responses
        if '/accounts/google/login/' in request.path:
            logger.info(
                f"🔐 OAUTH_RESPONSE: Google OAuth response | "
                f"Status: {response.status_code} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        # Log API authentication responses
        elif request.path.startswith('/api/users/token/'):
            logger.info(
                f"🔐 API_AUTH_RESPONSE: Token response | "
                f"Status: {response.status_code} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        # Log role switching responses
        elif '/switch-role/' in request.path:
            user_info = self._get_user_info(request)
            logger.info(
                f"🔄 ROLE_SWITCH_RESPONSE: Role switch response | "
                f"Status: {response.status_code} | "
                f"User: {user_info} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        # Log logout responses
        elif '/logout/' in request.path:
            user_info = self._get_user_info(request)
            logger.info(
                f"🚪 LOGOUT_RESPONSE: Logout response | "
                f"Status: {response.status_code} | "
                f"User: {user_info} | "
                f"IP: {self._get_client_ip(request)}"
            )
        
        return response
    
    def _get_user_info(self, request):
        """Extract user information"""
        if request.user.is_authenticated:
            User = get_user_model()
            try:
                user = User.objects.get(id=request.user.id)
                return f"{user.email} (ID: {user.id}, Role: {getattr(user, 'current_role', 'N/A')})"
            except Exception:
                return f"Authenticated user (ID: {request.user.id})"
        else:
            return "Anonymous"
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
