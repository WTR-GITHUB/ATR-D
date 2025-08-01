from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from lessons.models import Subject, Level

class CustomUserManager(BaseUserManager):
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
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
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
    role = models.CharField(_('role'), max_length=20, choices=Role.choices)
    contract_number = models.CharField(_('contract number'), max_length=100, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email}) - {self.get_role_display()}"

    def clean(self):
        super().clean()
        if not self.username:
            self.username = self.email  # Use email as username if not provided

class StudentParent(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_parents',
        verbose_name=_('student')
    )
    parent = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='parent_students',
        verbose_name=_('parent')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if self.student.role != User.Role.STUDENT:
            raise ValidationError(_('Selected user must have Student role'))
        if self.parent.role != User.Role.PARENT:
            raise ValidationError(_('Selected user must have Parent role'))
        if self.student == self.parent:
            raise ValidationError(_('Student and Parent cannot be the same user'))

    class Meta:
        verbose_name = _('student-parent relationship')
        verbose_name_plural = _('student-parent relationships')
        unique_together = ('student', 'parent')

    def __str__(self):
        return f"{self.student} - {self.parent}"

class StudentCurator(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='student_curators',
        verbose_name=_('student')
    )
    curator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='curator_students',
        verbose_name=_('curator')
    )
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'), null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if self.student.role != User.Role.STUDENT:
            raise ValidationError(_('Selected user must have Student role'))
        if self.curator.role != User.Role.CURATOR:
            raise ValidationError(_('Selected user must have Curator role'))
        if self.student == self.curator:
            raise ValidationError(_('Student and Curator cannot be the same user'))
        if self.end_date and self.end_date < self.start_date:
            raise ValidationError(_('End date cannot be earlier than start date'))

    class Meta:
        verbose_name = _('student-curator relationship')
        verbose_name_plural = _('student-curator relationships')
        unique_together = ('student', 'curator', 'start_date')

    def __str__(self):
        return f"{self.student} - {self.curator} ({self.start_date})"



class StudentSubjectLevel(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subject_levels',
        verbose_name=_('student')
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE,
        verbose_name=_('subject')
    )
    level = models.ForeignKey(
        Level, 
        on_delete=models.CASCADE,
        verbose_name=_('level')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if self.student.role != User.Role.STUDENT:
            raise ValidationError(_('Selected user must have Student role'))

    class Meta:
        verbose_name = _('student subject level')
        verbose_name_plural = _('student subject levels')
        unique_together = ('student', 'subject', 'level')

    def __str__(self):
        return f"{self.student} - {self.subject} ({self.level})"

class MentorSubject(models.Model):
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mentor_subjects',
        verbose_name=_('mentor')
    )
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE,
        verbose_name=_('subject')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if self.mentor.role != User.Role.MENTOR:
            raise ValidationError(_('Selected user must have Mentor role'))

    class Meta:
        verbose_name = _('mentor subject')
        verbose_name_plural = _('mentor subjects')
        unique_together = ('mentor', 'subject')

    def __str__(self):
        return f"{self.mentor} - {self.subject}"
