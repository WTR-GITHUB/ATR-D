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
        
        # DEBUG: Log middleware execution with detailed info
        logger.info(f"🔐 MIDDLEWARE DEBUG: === REQUEST START ===")
        logger.info(f"🔐 MIDDLEWARE DEBUG: Path: {request.path}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: Method: {request.method}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: User authenticated: {hasattr(request, 'user') and request.user.is_authenticated}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: Request cookies: {list(request.COOKIES.keys())}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: Headers: {dict(request.META)}")
        
        # MIDDLEWARE FIX: Don't authenticate here - AuthenticationMiddleware already did it
        # Just process the already authenticated user
        
        # JWT AUTHENTICATION FIX: Try to authenticate user with JWT first
        if not (hasattr(request, 'user') and request.user.is_authenticated):
            # Try JWT authentication
            from users.backends import JWTAuthenticationBackend
            jwt_backend = JWTAuthenticationBackend()
            jwt_user = jwt_backend.authenticate(request)
            
            if jwt_user:
                # Set the authenticated user
                request.user = jwt_user
                request.user.backend = 'users.backends.JWTAuthenticationBackend'
                logger.info(f"🔐 JWT AUTH SUCCESS: User {jwt_user.email} authenticated via JWT")
            else:
                logger.info(f"🔐 JWT AUTH FAILED: No valid JWT token found")
        
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
        
        # DEBUG: Log response details
        logger.info(f"🔐 MIDDLEWARE DEBUG: Response status: {response.status_code}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: Response headers: {dict(response.headers)}")
        logger.info(f"🔐 MIDDLEWARE DEBUG: === REQUEST END ===")
        
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
                # ROLE SWITCHING TOKEN LOGIC: Token'e tik current_role
                # roles ir default_role pašalinti - tikrinama iš DB
                current_role = token.get('current_role')
                
                # DEBUG: Log role information
                logger.info(f"🔐 MIDDLEWARE DEBUG: Current role from token: {current_role}")
                
                # ROLE SWITCHING TOKEN LOGIC: Naudoti current_role iš token'o
                # Tikrinti ar current_role leidžiama iš DB user.roles
                if current_role:
                    # Validate current_role against DB user.roles
                    if current_role in request.user.roles:
                        logger.info(f"🔐 MIDDLEWARE DEBUG: Validated current_role: {current_role}")
                        return current_role
                    else:
                        logger.warning(f"🔐 MIDDLEWARE DEBUG: Invalid current_role {current_role} for user {request.user.id}")
                        # Fallback to default_role
                        return request.user.get_default_role()
                    
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
