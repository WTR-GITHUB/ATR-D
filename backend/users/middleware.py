# /home/master/DIENYNAS/backend/users/middleware.py
# SEC-011: Role validation middleware for secure role-based access control
# PURPOSE: Replace vulnerable X-Current-Role header with server-side role validation
# UPDATES: Created for SEC-011 security fix

from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class RoleValidationMiddleware:
    """
    SEC-011: Middleware that validates user roles from JWT tokens and database
    Replaces vulnerable X-Current-Role header with secure server-side validation
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        """
        SEC-011: Process request and inject validated role into request context
        """
        # Initialize current_role as None
        request.current_role = None
        
        # Only process authenticated users
        if hasattr(request, 'user') and request.user.is_authenticated:
            try:
                # Try to get role from JWT token first (most secure)
                role_from_token = self._get_role_from_jwt_token(request)
                
                if role_from_token:
                    # Validate role exists in user's roles
                    if self._validate_role(request.user, role_from_token):
                        request.current_role = role_from_token
                        logger.debug(f"Role validated from JWT: {role_from_token} for user {request.user.id}")
                    else:
                        # Role from token is invalid, use default role
                        request.current_role = request.user.get_default_role()
                        logger.warning(f"Invalid role from JWT: {role_from_token} for user {request.user.id}, using default")
                else:
                    # Fallback to database default role
                    request.current_role = request.user.get_default_role()
                    logger.debug(f"Using default role from database: {request.current_role} for user {request.user.id}")
                    
            except Exception as e:
                # Error in role validation, use default role
                request.current_role = request.user.get_default_role()
                logger.error(f"Error in role validation for user {request.user.id}: {str(e)}")
        
        # Process the request
        response = self.get_response(request)
        return response

    def _get_role_from_jwt_token(self, request):
        """
        SEC-011: Extract role information from JWT token
        """
        try:
            # Try to get token from cookie first (SEC-001 implementation)
            access_token = request.COOKIES.get(settings.SIMPLE_JWT.get('AUTH_COOKIE_NAME', 'access_token'))
            
            # DEBUG: Log cookie information
            logger.info(f"🔐 MIDDLEWARE DEBUG: Request cookies: {list(request.COOKIES.keys())}")
            logger.info(f"🔐 MIDDLEWARE DEBUG: Access token from cookie: {access_token[:50] if access_token else 'None'}...")
            
            if not access_token:
                # Fallback to Authorization header
                auth_header = request.META.get('HTTP_AUTHORIZATION', '')
                if auth_header.startswith('Bearer '):
                    access_token = auth_header.split(' ')[1]
            
            if access_token:
                # Decode and validate token
                token = AccessToken(access_token)
                
                # DEBUG: Log token payload
                logger.info(f"🔐 MIDDLEWARE DEBUG: Token payload: {token.payload}")
                
                # Get role information from token claims
                # ROLE SWITCHING TOKEN LOGIC: Token'e nėra current_role
                # Tik roles ir default_role
                roles = token.get('roles', [])
                default_role = token.get('default_role')
                
                # DEBUG: Log role information
                logger.info(f"🔐 MIDDLEWARE DEBUG: Roles from token: {roles}")
                logger.info(f"🔐 MIDDLEWARE DEBUG: Default role from token: {default_role}")
                
                # ROLE SWITCHING TOKEN LOGIC: Leisti dirbti su bet kuria role iš token'o
                # default_role naudojamas tik login redirect'ui, ne middleware'e
                # Middleware tikrina ar role egzistuoja token'e ir leidžia dirbti su ja
                if roles:
                    # Grąžinti pirmąją role iš token'o (frontend valdo current role)
                    # Backend tikrina ar role egzistuoja token'e
                    selected_role = roles[0]
                    logger.info(f"🔐 MIDDLEWARE DEBUG: Selected role from token: {selected_role}")
                    logger.info(f"🔐 MIDDLEWARE DEBUG: Available roles in token: {roles}")
                    return selected_role
                    
        except (InvalidToken, TokenError, Exception) as e:
            logger.debug(f"Could not extract role from JWT token: {str(e)}")
            
        return None

    def _validate_role(self, user, role):
        """
        SEC-011: Validate that the role exists in user's database roles
        """
        try:
            # Check if role exists in user's roles from database
            return role in user.roles
        except Exception as e:
            logger.error(f"Error validating role {role} for user {user.id}: {str(e)}")
            return False
