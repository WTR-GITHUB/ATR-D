from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class PlansConfig(AppConfig):
    """
    Individualių ugdymo planų app konfigūracija
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'plans'
    verbose_name = _('Ugdymo planai')
