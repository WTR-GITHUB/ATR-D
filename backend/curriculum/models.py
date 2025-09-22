# /backend/curriculum/models.py
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Subject(models.Model):
    """
    Dalykų modelis - mokomų dalykų sąrašas
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Dalykas"
        verbose_name_plural = "Dalykai"
        ordering = ['name']

    def __str__(self):
        return self.name


class Level(models.Model):
    """
    Mokymo lygių modelis - mokymo lygių sąrašas
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Mokymo lygis"
        verbose_name_plural = "Mokymo lygiai"
        ordering = ['name']

    def __str__(self):
        return self.name


class Objective(models.Model):
    """
    Tikslų modelis - pamokų tikslai ir uždaviniai
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Tikslas"
        verbose_name_plural = "Tikslai"
        ordering = ['name']

    def __str__(self):
        return self.name


class Component(models.Model):
    """
    Komponentų modelis - pamokų komponentai ir dalys
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Komponentas"
        verbose_name_plural = "Komponentai"
        ordering = ['name']

    def __str__(self):
        return self.name


class Skill(models.Model):
    """
    Gebėjimų modelis - mokinių gebėjimai ir įgūdžiai
    """
    code = models.CharField(max_length=50, verbose_name="Sutrumpintas kodas", null=True, blank=True)
    name = models.CharField(max_length=255, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name="Dalykas", null=True, blank=True)

    class Meta:
        verbose_name = "Gebėjimas"
        verbose_name_plural = "Gebėjimai"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.subject.name if self.subject else 'Bendras'})"


class Competency(models.Model):
    """
    Kompetencijų modelis - mokinių kompetencijos
    """
    name = models.CharField(max_length=255, verbose_name="Kompetencijos pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Kompetencija"
        verbose_name_plural = "Kompetencijos"
        ordering = ['name']

    def __str__(self):
        return self.name


class Virtue(models.Model):
    """
    Dorybių modelis - ugdomos dorybės ir vertybės
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")

    class Meta:
        verbose_name = "Dorybė"
        verbose_name_plural = "Dorybės"
        ordering = ['name']

    def __str__(self):
        return self.name


class CompetencyAtcheve(models.Model):
    """
    BUP Kompetencijų modelis - apibrėžia kompetencijų pasiekimo veiksmus
    """
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, verbose_name="Dalykas", null=True, blank=True)
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, verbose_name="Kompetencija")
    virtues = models.ManyToManyField(Virtue, verbose_name="Dorybės")
    todos = models.TextField(blank=True, verbose_name="Todo sąrašas", help_text="Veiksmai, kuriuos reikia atlikti")

    class Meta:
        verbose_name = "BUP Kompetencija"
        verbose_name_plural = "BUP Kompetencijos"

    def __str__(self):
        return f"{self.competency.name} - {self.subject.name if self.subject else 'Bendras'}"


class LessonManager(models.Manager):
    """
    Manager'is pamokoms - automatiškai filtruoja ištrintas pamokas
    """
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_including_deleted(self):
        """Grąžina visas pamokas, įskaitant ištrintas"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Grąžina tik ištrintas pamokas"""
        return super().get_queryset().filter(is_deleted=True)

class Lesson(models.Model):
    """
    Pamokų modelis - ugdymo planų šablonai
    """
    title = models.CharField(max_length=200, verbose_name="Pavadinimas")
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.CASCADE, 
        verbose_name="Dalykas"
    )
    levels = models.ManyToManyField(
        Level, 
        blank=True, 
        verbose_name="Mokymo lygiai"
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='lessons_mentored',
        verbose_name="Mentorius"
    )
    content = models.TextField(blank=True, verbose_name="Mokomoji medžiaga")
    topic = models.CharField(
        max_length=255,
        blank=True,
        verbose_name="Tema"
    )
    objectives = models.TextField(
        blank=True,
        verbose_name="Tikslai",
        help_text="Tikslai JSON formatu"
    )
    components = models.TextField(
        blank=True,
        verbose_name="Komponentai",
        help_text="Komponentai JSON formatu"
    )
    skills = models.ManyToManyField(
        Skill, 
        blank=True,
        verbose_name="Gebėjimai"
    )
    virtues = models.ManyToManyField(
        Virtue, 
        blank=True,
        verbose_name="Dorybės"
    )
    focus = models.TextField(
        blank=True,
        verbose_name="Fokusas veiksmai",
        help_text="Fokusas veiksmai JSON formatu"
    )
    # Pasiekimo lygiai su procentais
    slenkstinis = models.TextField(
        blank=True,
        verbose_name="Slenkstinis lygis (54%)",
        help_text="Slenkstinio lygio reikalavimai"
    )
    bazinis = models.TextField(
        blank=True,
        verbose_name="Bazinis lygis (74%)",
        help_text="Bazinio lygio reikalavimai"
    )
    pagrindinis = models.TextField(
        blank=True,
        verbose_name="Pagrindinis lygis (84%)",
        help_text="Pagrindinio lygio reikalavimai"
    )
    aukstesnysis = models.TextField(
        blank=True,
        verbose_name="Aukštesnysis lygis (100%)",
        help_text="Aukštesniojo lygio reikalavimai"
    )
    competency_atcheves = models.ManyToManyField(
        'CompetencyAtcheve', 
        blank=True,
        verbose_name="BUP Kompetencijos"
    )
    # Soft delete laukai
    is_deleted = models.BooleanField(default=False, verbose_name="Ištrinta")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Ištrinta")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Sukurta")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atnaujinta")

    # Naudojame custom manager'į
    objects = LessonManager()

    class Meta:
        verbose_name = "Pamoka"
        verbose_name_plural = "Pamokos"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name}"
    
    def delete(self, *args, **kwargs):
        """
        Soft delete - nebetriname pamokos, tik pažymime kaip ištrintą
        Išlaikome visus susijusius duomenis (mokinio istoriją, atsiskaitymus)
        """
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Atkurti pamoką"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()
    
    def hard_delete(self, *args, **kwargs):
        """Sunkus trynimas - tik administratoriams"""
        super().delete(*args, **kwargs)
