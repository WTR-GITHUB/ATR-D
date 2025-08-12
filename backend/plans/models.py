# backend/plans/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class LessonSequence(models.Model):
    """
    Pamokų sekos šablonas - pernaudojamas keliems mokiniams/planams
    """
    name = models.CharField(_('Pavadinimas'), max_length=200)
    description = models.TextField(_('Aprašymas'), blank=True)
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE, verbose_name=_('Dalykas'))
    level = models.ForeignKey('curriculum.Level', on_delete=models.CASCADE, verbose_name=_('Lygis'))
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        verbose_name=_('Sukūrė'),
        help_text=_('Kas sukūrė šią seką (nebūtina)')
    )
    is_active = models.BooleanField(_('Aktyvi'), default=True)
    created_at = models.DateTimeField(_('Sukurta'), auto_now_add=True)

    class Meta:
        verbose_name = _('Pamokų seka')
        verbose_name_plural = _('Pamokų sekos')
        unique_together = [('name', 'subject', 'level')]

    def __str__(self):
        return f"{self.name} ({self.subject} / {self.level})"


class LessonSequenceItem(models.Model):
    """
    Sekos elementas - konkreti pamoka ir jos eiliškumas
    """
    sequence = models.ForeignKey(LessonSequence, on_delete=models.CASCADE, related_name='items', verbose_name=_('Seka'))
    lesson = models.ForeignKey('curriculum.Lesson', on_delete=models.CASCADE, verbose_name=_('Pamoka'))
    position = models.PositiveIntegerField(_('Eiliškumas'), default=1)

    class Meta:
        verbose_name = _('Sekos elementas')
        verbose_name_plural = _('Sekos elementai')
        ordering = ['position']
        unique_together = [('sequence', 'position')]

    def __str__(self):
        return f"{self.sequence} → {self.position}: {self.lesson}"


class IMUPlan(models.Model):
    """
    Individualus mokinio ugdymo planas - susieja mokinį, veiklą ir pamoką
    """
    STATUS_CHOICES = [
        ('planned', 'Suplanuota'),
        ('in_progress', 'Vyksta'),
        ('completed', 'Baigta'),
        ('missed', 'Praleista'),
        ('cancelled', 'Atšaukta'),
    ]
    
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='imu_plans',
        verbose_name=_('Mokinys')
    )
    global_schedule = models.ForeignKey(
        'schedule.GlobalSchedule', 
        on_delete=models.CASCADE, 
        verbose_name=_('Veikla (GlobalSchedule)')
    )
    lesson = models.ForeignKey(
        'curriculum.Lesson', 
        on_delete=models.CASCADE, 
        verbose_name=_('Pamoka')
    )
    status = models.CharField(
        _('Būsena'), 
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='planned'
    )
    started_at = models.DateTimeField(_('Pradėta'), null=True, blank=True)
    completed_at = models.DateTimeField(_('Baigta'), null=True, blank=True)
    notes = models.TextField(_('Pastabos'), blank=True)
    created_at = models.DateTimeField(_('Sukurta'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Atnaujinta'), auto_now=True)

    class Meta:
        verbose_name = _('Individualus mokinio ugdymo planas')
        verbose_name_plural = _('Individualūs mokinių ugdymo planai')
        unique_together = [('student', 'global_schedule')]

    def __str__(self):
        return f"{self.student} - {self.global_schedule} - {self.lesson} ({self.get_status_display()})"

    def clean(self):
        """Validacija: mokinys turi rolę student"""
        if not self.student.has_role('student'):
            raise ValidationError(_('Planas gali būti priskirtas tik mokiniui'))

    def save(self, *args, **kwargs):
        """Automatiškai nustato pradžios laiką, jei statusas 'in_progress'"""
        if self.status == 'in_progress' and not self.started_at:
            from django.utils import timezone
            self.started_at = timezone.now()
        super().save(*args, **kwargs)
