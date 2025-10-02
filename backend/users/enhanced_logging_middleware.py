# /var/www/ATR-D/backend/users/enhanced_logging_middleware.py
# Enhanced Logging Middleware for A-DIENYNAS
# PURPOSE: Provide detailed logging with user information
# UPDATES: Created enhanced logging middleware with user details, IP, referrer, and request info

import logging
import time
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class EnhancedLoggingMiddleware(MiddlewareMixin):
    """
    Enhanced logging middleware that provides detailed information about requests
    including user details, IP address, referrer, and request timing.
    """
    
    def process_request(self, request):
        """Log incoming request with enhanced details"""
        request._start_time = time.time()
        
        # Get user information
        user_info = self._get_user_info(request)
        
        # Get request details
        request_info = self._get_request_info(request)
        
        # Log the request
        logger.info(
            f"🌐 REQUEST: {request.method} {request.path} | "
            f"User: {user_info} | "
            f"IP: {request_info['ip']} | "
            f"Referrer: {request_info['referrer']} | "
            f"User-Agent: {request_info['user_agent']} | "
            f"Session: {request_info['session_id']}"
        )
        
        return None
    
    def process_response(self, request, response):
        """Log response with timing information"""
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
            
            # Get user information
            user_info = self._get_user_info(request)
            
            # Log the response
            logger.info(
                f"📤 RESPONSE: {request.method} {request.path} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.3f}s | "
                f"User: {user_info} | "
                f"Size: {len(response.content)} bytes"
            )
        
        return response
    
    def _get_user_info(self, request):
        """Extract detailed user information"""
        if request.user.is_authenticated:
            User = get_user_model()
            try:
                user = User.objects.get(id=request.user.id)
                return (
                    f"{user.email} ({user.first_name} {user.last_name}) | "
                    f"Role: {getattr(user, 'current_role', 'N/A')} | "
                    f"ID: {user.id} | "
                    f"Active: {user.is_active}"
                )
            except Exception as e:
                return f"Authenticated user (ID: {request.user.id}) - Error: {str(e)}"
        else:
            return "Anonymous"
    
    def _get_request_info(self, request):
        """Extract request information"""
        return {
            'ip': self._get_client_ip(request),
            'referrer': request.META.get('HTTP_REFERER', 'N/A'),
            'user_agent': request.META.get('HTTP_USER_AGENT', 'N/A')[:100],  # Truncate long user agents
            'session_id': request.session.session_key or 'N/A'
        }
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
