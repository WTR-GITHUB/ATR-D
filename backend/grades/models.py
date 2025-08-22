# backend/grades/models.py

# Grades aplikacijos modeliai - pasiekimų lygių ir vertinimo sistema
# CHANGE: Pilnai perdaryta sistema pagal frontend logiką su pasiekimų lygiais S, B, P, A
# CHANGE: Pridėtas automatinis pasiekimų lygio skaičiavimas pagal procentus

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError


class AchievementLevel(models.Model):
    """
    Pasiekimų lygių modelis pagal frontend logiką
    CHANGE: Sukurtas naujas modelis pasiekimų lygiams S, B, P, A
    """
    ACHIEVEMENT_CHOICES = [
        ('S', 'Slenkstinis'),
        ('B', 'Bazinis'),
        ('P', 'Pagrindinis'),
        ('A', 'Aukštesnysis'),
    ]
    
    code = models.CharField(
        _('Kodas'),
        max_length=1,
        choices=ACHIEVEMENT_CHOICES,
        unique=True,
        help_text=_('Pasiekimų lygio kodas: S, B, P, A')
    )
    name = models.CharField(
        _('Pavadinimas'),
        max_length=50,
        help_text=_('Pasiekimų lygio pavadinimas')
    )
    min_percentage = models.IntegerField(
        _('Minimalus procentas'),
        help_text=_('Minimalus procentas šiam lygiui')
    )
    max_percentage = models.IntegerField(
        _('Maksimalus procentas'),
        help_text=_('Maksimalus procentas šiam lygiui')
    )
    color = models.CharField(
        _('Spalva'),
        max_length=20,
        help_text=_('Spalva frontend\'e: žalias, mėlynas, oranžinis, raudonas')
    )
    description = models.TextField(
        _('Aprašymas'),
        blank=True,
        help_text=_('Pasiekimų lygio aprašymas')
    )
    
    class Meta:
        verbose_name = _('Pasiekimų lygis')
        verbose_name_plural = _('Pasiekimų lygiai')
        ordering = ['min_percentage']
    
    def __str__(self):
        return f"{self.code} - {self.name} ({self.min_percentage}-{self.max_percentage}%)"
    
    def clean(self):
        """Validacija: procentų intervalai turi būti logiški"""
        if self.min_percentage >= self.max_percentage:
            raise ValidationError(_('Minimalus procentas turi būti mažesnis už maksimalų'))
        
        if self.min_percentage < 0 or self.max_percentage > 100:
            raise ValidationError(_('Procentai turi būti tarp 0 ir 100'))
    
    @classmethod
    def get_level_by_percentage(cls, percentage):
        """
        Grąžina pasiekimų lygį pagal procentus
        CHANGE: Frontend logikos implementacija
        """
        try:
            percentage = int(percentage)
            if 40 <= percentage <= 54:
                return cls.objects.get(code='S')
            elif 55 <= percentage <= 69:
                return cls.objects.get(code='B')
            elif 70 <= percentage <= 84:
                return cls.objects.get(code='P')
            elif 85 <= percentage <= 100:
                return cls.objects.get(code='A')
            else:
                return None
        except (ValueError, cls.DoesNotExist):
            return None


class Grade(models.Model):
    """
    Mokinio pasiekimų vertinimas pagal frontend logiką
    CHANGE: Pilnai perdarytas modelis su automatinio pasiekimų lygio skaičiavimu
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades_received',
        verbose_name=_('Mokinys'),
        help_text=_('Mokinys, kuriam duodamas vertinimas')
    )
    lesson = models.ForeignKey(
        'curriculum.Lesson',
        on_delete=models.CASCADE,
        related_name='grades',
        verbose_name=_('Pamoka'),
        help_text=_('Pamoka, už kurią duodamas vertinimas')
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades_given',
        verbose_name=_('Mentorius'),
        help_text=_('Mentorius, kuris duoda vertinimą')
    )
    
    # Pagrindiniai vertinimo laukai
    achievement_level = models.ForeignKey(
        AchievementLevel,
        on_delete=models.CASCADE,
        verbose_name=_('Pasiekimų lygis'),
        help_text=_('Automatiškai nustatomas pagal procentus'),
        null=True,  # Leidžiame null reikšmes esamiems įrašams
        blank=True
    )
    percentage = models.IntegerField(
        _('Procentai'),
        validators=[
            MinValueValidator(0, _('Procentai negali būti mažiau nei 0')),
            MaxValueValidator(100, _('Procentai negali būti daugiau nei 100'))
        ],
        help_text=_('Vertinimas procentais (0-100)')
    )
    
    # Susiejimas su IMUPlan sistema
    imu_plan = models.ForeignKey(
        'plans.IMUPlan',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_('IMU Planas'),
        help_text=_('Susiejimas su individualiu mokinio ugdymo planu')
    )
    
    # Papildoma informacija
    notes = models.TextField(
        verbose_name=_('Pastabos'),
        blank=True,
        help_text=_('Papildomos pastabos apie vertinimą')
    )
    created_at = models.DateTimeField(
        verbose_name=_('Sukurta'),
        auto_now_add=True,
        help_text=_('Vertinimo sukūrimo laikas')
    )
    updated_at = models.DateTimeField(
        verbose_name=_('Atnaujinta'),
        auto_now=True,
        help_text=_('Vertinimo atnaujinimo laikas')
    )
    
    class Meta:
        verbose_name = _('Vertinimas')
        verbose_name_plural = _('Vertinimai')
        ordering = ['-created_at']
        unique_together = ['student', 'lesson', 'imu_plan']
    
    def __str__(self):
        level_info = f"{self.achievement_level.code} ({self.percentage}%)"
        return f"{self.student} - {self.lesson} - {level_info}"
    
    def clean(self):
        """Validacija: tikriname vartotojų roles ir duomenų teisingumą"""
        # Tikriname, ar studentas yra studentas
        if not self.student.has_role('student'):
            raise ValidationError(_('Vertinimas gali būti duotas tik mokiniui'))
        
        # Tikriname, ar mentorius yra mentorius
        if not self.mentor.has_role('mentor'):
            raise ValidationError(_('Vertinimą gali duoti tik mentorius'))
        
        # Tikriname, ar studentas ir mentorius nėra tas pats asmuo
        if self.student == self.mentor:
            raise ValidationError(_('Studentas ir mentorius negali būti tas pats asmuo'))
        
        # Tikriname, ar pasiekimų lygis atitinka procentus
        expected_level = AchievementLevel.get_level_by_percentage(self.percentage)
        if expected_level and expected_level != self.achievement_level:
            raise ValidationError(
                _('Pasiekimų lygis %(level)s neatitinka procentų %(percent)s%%') % {
                    'level': self.achievement_level.name,
                    'percent': self.percentage
                }
            )
    
    def save(self, *args, **kwargs):
        """Automatiškai nustatome pasiekimų lygį pagal procentus"""
        if not self.achievement_level_id:
            self.achievement_level = AchievementLevel.get_level_by_percentage(self.percentage)
        
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def grade_letter(self):
        """
        Grąžina pasiekimų lygio kodą (S, B, P, A)
        CHANGE: Dabar grąžina frontend logikos lygius
        """
        return self.achievement_level.code
    
    @property
    def grade_description(self):
        """
        Grąžina pasiekimų lygio aprašymą
        CHANGE: Dabar grąžina frontend logikos aprašymus
        """
        return self.achievement_level.name
    
    @property
    def grade_color(self):
        """
        Grąžina pasiekimų lygio spalvą frontend'e
        CHANGE: Naujas property spalvų valdymui
        """
        return self.achievement_level.color


class GradeCalculation(models.Model):
    """
    Automatinio pasiekimų lygio skaičiavimo istorija
    CHANGE: Naujas modelis skaičiavimų sekimui
    """
    percentage = models.IntegerField(
        _('Procentai'),
        help_text=_('Įvesti procentai')
    )
    calculated_level = models.ForeignKey(
        AchievementLevel,
        on_delete=models.CASCADE,
        verbose_name=_('Apskaičiuotas lygis'),
        help_text=_('Automatiškai apskaičiuotas pasiekimų lygis')
    )
    calculation_date = models.DateTimeField(
        verbose_name=_('Skaičiavimo data'),
        auto_now_add=True,
        help_text=_('Kada buvo atliktas skaičiavimas')
    )
    
    class Meta:
        verbose_name = _('Pasiekimų lygio skaičiavimas')
        verbose_name_plural = _('Pasiekimų lygių skaičiavimai')
        ordering = ['-calculation_date']
    
    def __str__(self):
        return f"{self.percentage}% → {self.calculated_level.code} ({self.calculation_date})"
