from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Period(models.Model):
    """
    Pamokų periodų modelis - valdo pamokų laikų intervalus
    """
    starttime = models.TimeField(_('Pradžios laikas'), help_text=_('Pamokos pradžios laikas'))
    endtime = models.TimeField(_('Pabaigos laikas'), help_text=_('Pamokos pabaigos laikas'))
    duration = models.IntegerField(_('Trukmė minutėmis'), help_text=_('Pamokos trukmė minutėmis'))
    
    class Meta:
        verbose_name = _('Periodas')
        verbose_name_plural = _('Periodai')
        ordering = ['starttime']
    
    def __str__(self):
        return f"{self.starttime} - {self.endtime} ({self.duration} min)"
    
    def save(self, *args, **kwargs):
        # Automatiškai skaičiuoti trukmę
        if self.starttime and self.endtime:
            from datetime import datetime, timedelta
            start = datetime.combine(datetime.today(), self.starttime)
            end = datetime.combine(datetime.today(), self.endtime)
            self.duration = int((end - start).total_seconds() / 60)
        super().save(*args, **kwargs)


class Classroom(models.Model):
    """
    Klasės modelis - valdo mokymo patalpas
    """
    name = models.CharField(_('Pavadinimas'), max_length=100, help_text=_('Klasės pavadinimas'))
    description = models.TextField(_('Aprašymas'), blank=True, help_text=_('Klasės aprašymas'))
    
    class Meta:
        verbose_name = _('Klasė')
        verbose_name_plural = _('Klasės')
        ordering = ['name']
    
    def __str__(self):
        return self.name


class GlobalSchedule(models.Model):
    """
    Globalaus tvarkaraščio modelis - valdo mokyklos tvarkaraštį
    """
    date = models.DateField(_('Data'), help_text=_('Pamokos data'))
    weekday = models.CharField(_('Savaitės diena'), max_length=20, help_text=_('Savaitės diena'))
    period = models.ForeignKey(Period, on_delete=models.CASCADE, verbose_name=_('Periodas'), help_text=_('Pamokos periodas'))
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, verbose_name=_('Klasė'), help_text=_('Pamokos klasė'))
    subject = models.ForeignKey('curriculum.Subject', on_delete=models.CASCADE, verbose_name=_('Dalykas'), help_text=_('Mokomas dalykas'))
    level = models.ForeignKey('curriculum.Level', on_delete=models.CASCADE, verbose_name=_('Lygis'), help_text=_('Mokymo lygis'))
    lesson = models.ForeignKey('curriculum.Lesson', on_delete=models.CASCADE, verbose_name=_('Pamoka'), help_text=_('Pamokos šablonas'))
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name=_('Mentorius'), help_text=_('Pamokos vedėjas (tik mentoriai)'))
    
    class Meta:
        verbose_name = _('Globalus tvarkaraštis')
        verbose_name_plural = _('Globalus tvarkaraštis')
        ordering = ['date', 'period__starttime']
        unique_together = ['date', 'period', 'classroom']
    
    def __str__(self):
        return f"{self.date} - {self.period} - {self.subject} - {self.user}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Tikriname, ar vartotojas yra mentorius
        if self.user and not self.user.has_role('mentor'):
            raise ValidationError(_('Tik mentoriai gali vesti pamokas'))
        
        # Tikriname, ar klasė nėra užimta šiuo laiku
        if self.date and self.period and self.classroom:
            conflicting_schedules = GlobalSchedule.objects.filter(
                date=self.date,
                period=self.period,
                classroom=self.classroom
            ).exclude(pk=self.pk)
            
            if conflicting_schedules.exists():
                raise ValidationError(_('Klasė jau užimta šiuo laiku'))
    
    def save(self, *args, **kwargs):
        # Automatiškai nustatyti savaitės dieną
        if self.date:
            import calendar
            weekday_names = {
                0: 'Pirmadienis',
                1: 'Antradienis', 
                2: 'Trečiadienis',
                3: 'Ketvirtadienis',
                4: 'Penktadienis',
                5: 'Šeštadienis',
                6: 'Sekmadienis'
            }
            self.weekday = weekday_names[self.date.weekday()]
        
        self.full_clean()
        super().save(*args, **kwargs)
