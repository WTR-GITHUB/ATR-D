# backend/users/apps.py
from django.apps import AppConfig


class UsersConfig(AppConfig):
    """
    Vartotojų app konfigūracija - valdo vartotojų app'o nustatymus
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'
    verbose_name = 'Vartotojai'
