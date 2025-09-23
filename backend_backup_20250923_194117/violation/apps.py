# backend/violation/apps.py

# Violation application configuration for A-DIENYNAS system
# Configures the violation Django application with proper settings
# CHANGE: Created new violation application configuration

from django.apps import AppConfig


class ViolationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'violation'
    verbose_name = 'Pažeidimų valdymas'
    
    def ready(self):
        """
        Import signal handlers when the app is ready
        """
        try:
            import violation.signals  # noqa
        except ImportError:
            pass