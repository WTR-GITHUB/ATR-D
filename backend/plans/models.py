# backend/plans/models.py
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


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
    lesson = models.ForeignKey(
        'curriculum.Lesson', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name=_('Pamoka')
    )
    position = models.PositiveIntegerField(_('Eiliškumas'), default=1)

    class Meta:
        verbose_name = _('Sekos elementas')
        verbose_name_plural = _('Sekos elementai')
        ordering = ['position']
        unique_together = [('sequence', 'position')]

    def __str__(self):
        lesson_info = self.lesson.title if self.lesson else 'IŠTRINTA PAMOKA'
        return f"{self.sequence} → {self.position}: {lesson_info}"


class IMUPlan(models.Model):
    """
    Individualus mokinio ugdymo planas - susieja mokinį, veiklą ir pamoką
    REFAKTORINIMAS: Pašalinti plan_status, status, started_at, completed_at - perkelta į GlobalSchedule
    """
    # Lankomumo statusai (AttendanceMarker komponentui)
    ATTENDANCE_CHOICES = [
        ('present', 'Dalyvavo'),        # Mokinys dalyvavo pamokoje
        ('absent', 'Nedalyvavo'),       # Mokinys nedalyvavo pamokoje
        ('left', 'Paliko'),            # Mokinys paliko pamoką
        ('excused', 'Pateisinta'),     # Mokinys pateisintas
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
        null=True,
        blank=True,
        verbose_name=_('Pamoka')
    )
    
    # REFAKTORINIMAS: Lankomumo statusas paliekamas IMUPlan, planų valdymas perkeltas į GlobalSchedule
    attendance_status = models.CharField(
        _('Lankomumo būsena'), 
        max_length=20, 
        choices=ATTENDANCE_CHOICES, 
        default=None,
        null=True,     # leisti NULL reikšmes duomenų bazėje
        blank=True,    # leisti tuščias reikšmes formose
        help_text=_('Mokinio lankomumo būsena: dalyvavo, nedalyvavo, vėlavo, pateisinta')
    )
    
    notes = models.TextField(_('Pastabos'), blank=True)
    created_at = models.DateTimeField(_('Sukurta'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Atnaujinta'), auto_now=True)

    class Meta:
        verbose_name = _('Individualus mokinio ugdymo planas')
        verbose_name_plural = _('Individualūs mokinių ugdymo planai')
        unique_together = [('student', 'global_schedule')]

    def __str__(self):
        attendance_display = self.get_attendance_status_display() if self.attendance_status else "Nepažymėta"
        return f"{self.student} - {self.global_schedule} - {self.lesson} (Lankomumas: {attendance_display})"

    def clean(self):
        """Validacija: mokinys turi rolę student"""
        if not self.student.has_role('student'):
            raise ValidationError(_('Planas gali būti priskirtas tik mokiniui'))

    def save(self, *args, **kwargs):
        """
        REFAKTORINIMAS: Pašalinta plan_status ir status logika - perkelta į GlobalSchedule
        """
        super().save(*args, **kwargs)
