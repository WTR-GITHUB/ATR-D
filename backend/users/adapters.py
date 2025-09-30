# /backend/users/adapters.py
"""
Custom django-allauth adapters for user management.

Purpose: Control user registration and social account creation
Updates: Created custom adapters to prevent unauthorized user registration
Notes: Based on example configuration, prevents new user creation via OAuth
"""

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


class NoNewUsersAccountAdapter(DefaultAccountAdapter):
    """
    Custom account adapter that prevents new user registration.
    
    This adapter blocks all attempts to create new user accounts
    through django-allauth, ensuring only existing users can log in.
    """
    
    def is_open_for_signup(self, request):
        """
        Prevent new user registration.
        
        Returns False to block all signup attempts.
        """
        return False
    
    def save_user(self, request, user, form, commit=True):
        """
        Override save_user to prevent account creation.
        
        Raises ValidationError if someone tries to create a new account.
        """
        raise ValidationError("New user registration is not allowed")


class NoNewSocialUsersAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom social account adapter that prevents new user creation via OAuth.
    
    This adapter allows OAuth login only for existing users.
    If a user doesn't exist in the system, login will be denied.
    """
    
    def is_open_for_signup(self, request, sociallogin):
        """
        Check if social login is allowed for this user.
        
        Only allows login if user already exists in the system.
        """
        # Get email from social account
        email = sociallogin.account.extra_data.get('email')
        
        if not email:
            return False
        
        # Check if user exists in our system
        try:
            User.objects.get(email=email)
            return True  # User exists, allow login
        except User.DoesNotExist:
            return False  # User doesn't exist, deny login
    
    def save_user(self, request, sociallogin, form=None):
        """
        Override save_user to prevent automatic user creation.
        
        This method is called when a new social account is created.
        We raise an error to prevent this.
        """
        raise ValidationError("New user creation via social login is not allowed")
    
    def pre_social_login(self, request, sociallogin):
        """
        Hook called before social login.
        
        We can add additional validation here if needed.
        """
        # Get email from social account
        email = sociallogin.account.extra_data.get('email')
        
        if not email:
            raise ValidationError("Email is required for social login")
        
        # Check if user exists
        try:
            user = User.objects.get(email=email)
            # Link the social account to existing user
            sociallogin.user = user
        except User.DoesNotExist:
            raise ValidationError("User account does not exist. Please contact administrator.")
    
    def get_connect_redirect_url(self, request, socialaccount):
        """
        Redirect URL after successful social account connection.
        """
        from django.conf import settings
        return settings.ACCOUNT_LOGIN_REDIRECT_URL
