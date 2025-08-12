# backend/users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

# Custom User Manager
class CustomUserManager(BaseUserManager):
    """
    Vartotojų valdymo klasė - sukuria ir valdo vartotojus
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('roles', [User.Role.ADMIN])

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

# User Model
class User(AbstractUser):
    """
    Vartotojų modelis - pagrindinis vartotojų valdymo modelis
    """
    class Role(models.TextChoices):
        ADMIN = 'admin', _('Admin')
        STUDENT = 'student', _('Student')
        PARENT = 'parent', _('Parent')
        CURATOR = 'curator', _('Curator')
        MENTOR = 'mentor', _('Mentor')

    username = None  # Remove username field completely
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    birth_date = models.DateField(_('birth date'), null=True, blank=True)
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=30, blank=True)
    roles = models.JSONField(_('roles'), default=list, help_text=_('Vartotojo rolės sąrašas'))
    contract_number = models.CharField(_('contract number'), max_length=100, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'roles']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        roles_display = ', '.join([str(self.get_role_display(role)) for role in self.roles]) if self.roles else 'No roles'
        return f"{self.first_name} {self.last_name} ({self.email}) - {roles_display}"

    def get_role_display(self, role):
        """
        Grąžina rolės pavadinimą
        """
        return dict(self.Role.choices).get(role, role)

    def has_role(self, role):
        """
        Patikrina ar vartotojas turi nurodytą rolę
        """
        return role in self.roles

    def has_any_role(self, roles):
        """
        Patikrina ar vartotojas turi bent vieną iš nurodytų rolių
        """
        return any(role in self.roles for role in roles)

    def clean(self):
        super().clean()
        if not self.username:
            self.username = self.email  # Use email as username if not provided
