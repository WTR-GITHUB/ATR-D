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
    # Planų valdymo statusai (ugdymo planų kūrimui ir valdymui)
    PLAN_STATUS_CHOICES = [
        ('planned', 'Suplanuota'),      # Planas sukurtas, bet dar nepradėtas
        ('in_progress', 'Vyksta'),      # Planas vykdomas
        ('completed', 'Baigta'),        # Planas baigtas
    ]
    
    # Lankomumo statusai (AttendanceMarker komponentui)
    ATTENDANCE_CHOICES = [
        ('present', 'Dalyvavo'),        # Mokinys dalyvavo pamokoje
        ('absent', 'Nedalyvavo'),       # Mokinys nedalyvavo pamokoje
        ('late', 'Vėlavo'),            # Mokinys vėlavo į pamoką
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
        verbose_name=_('Pamoka')
    )
    
    # REFAKTORINIMAS: Atskiri statusai planų valdymui ir lankomumo žymėjimui
    plan_status = models.CharField(
        _('Plano būsena'), 
        max_length=20, 
        choices=PLAN_STATUS_CHOICES, 
        default='planned',
        help_text=_('Ugdymo plano būsena: suplanuota, vyksta, baigta')
    )
    
    attendance_status = models.CharField(
        _('Lankomumo būsena'), 
        max_length=20, 
        choices=ATTENDANCE_CHOICES, 
        default='present',
        help_text=_('Mokinio lankomumo būsena: dalyvavo, nedalyvavo, vėlavo, pateisinta')
    )
    
    # Laikinai paliekame seną status stulpelį migracijos metu (bus pašalintas vėliau)
    status = models.CharField(
        _('Būsena (senas)'), 
        max_length=20, 
        choices=PLAN_STATUS_CHOICES + ATTENDANCE_CHOICES, 
        default='planned',
        help_text=_('SENAS STULPELIS - bus pašalintas po migracijos')
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
        return f"{self.student} - {self.global_schedule} - {self.lesson} (Planas: {self.get_plan_status_display()}, Lankomumas: {self.get_attendance_status_display()})"

    def clean(self):
        """Validacija: mokinys turi rolę student"""
        if not self.student.has_role('student'):
            raise ValidationError(_('Planas gali būti priskirtas tik mokiniui'))

    def save(self, *args, **kwargs):
        """
        Automatiškai nustato pradžios laiką, jei planas pradėtas vykdyti
        REFAKTORINIMAS: Dabar tikriname plan_status vietoj status
        """
        if self.plan_status == 'in_progress' and not self.started_at:
            self.started_at = timezone.now()
        
        # REFAKTORINIMAS: Sinchronizuojame seną status stulpelį migracijos metu
        # Po migracijos šis kodas bus pašalintas
        if hasattr(self, 'status'):
            # Jei plan_status yra planų valdymo statusas, naudojame jį
            if self.plan_status in ['planned', 'in_progress', 'completed']:
                self.status = self.plan_status
            # Jei attendance_status yra lankomumo statusas, naudojame jį
            elif self.attendance_status in ['present', 'absent', 'late', 'excused']:
                self.status = self.attendance_status
        
        super().save(*args, **kwargs)

    @classmethod
    def bulk_start_activity(cls, global_schedule_id):
        """
        Pradeda veiklą visiems mokiniams, kurie priklauso šiai veiklai (GlobalSchedule slot)
        REFAKTORINIMAS: Atnaujina attendance_status į 'present' ir plan_status į 'in_progress'
        """
        current_time = timezone.now()
        
        # Atnaujina visus planus, kurie priklauso šiai veiklai
        # REFAKTORINIMAS: Dabar atnaujiname abu statusus
        updated_count = cls.objects.filter(
            global_schedule_id=global_schedule_id,
            # Galima pradėti iš šių būsenų
            plan_status__in=['planned'],
            attendance_status__in=['absent', 'late', 'excused']
        ).update(
            plan_status='in_progress',      # Planas pradėtas vykdyti
            attendance_status='present',    # Mokinys dalyvavo
            started_at=current_time,
            # REFAKTORINIMAS: Sinchronizuojame seną status stulpelį
            status='present'  # Laikinai migracijos metu
        )
        
        return {
            'updated_count': updated_count,
            'started_at': current_time
        }

    @classmethod
    def bulk_end_activity(cls, global_schedule_id):
        """
        Baigia veiklą visiems mokiniams, kurie priklauso šiai veiklai (GlobalSchedule slot)
        REFAKTORINIMAS: Atnaujina plan_status į 'completed' ir palieka attendance_status nepakeistą
        """
        current_time = timezone.now()
        
        # Atnaujina visus planus, kurie vyksta (plan_status 'in_progress')
        updated_count = cls.objects.filter(
            global_schedule_id=global_schedule_id,
            plan_status='in_progress'  # Galima baigti tik 'in_progress' planus
        ).update(
            plan_status='completed',        # Planas baigtas
            completed_at=current_time,
            # REFAKTORINIMAS: Sinchronizuojame seną status stulpelį
            status='completed'  # Laikinai migracijos metu
        )
        
        return {
            'updated_count': updated_count,
            'completed_at': current_time
        }
