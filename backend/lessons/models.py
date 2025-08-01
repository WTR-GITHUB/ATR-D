from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

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

class Topic(models.Model):
    """
    Temos modelis - pamokų temos kategorijos
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")
    
    class Meta:
        verbose_name = "Tema"
        verbose_name_plural = "Temos"
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
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")
    
    class Meta:
        verbose_name = "Gebėjimas"
        verbose_name_plural = "Gebėjimai"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Grade(models.Model):
    """
    Vertinimo modelis - mokinių pažymių saugojimas procentais ir konvertavimas į vertinimus
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades_received',
        verbose_name="Mokinys"
    )
    lesson = models.ForeignKey(
        'Lesson',
        on_delete=models.CASCADE,
        related_name='grades',
        verbose_name="Pamoka"
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grades_given',
        verbose_name="Mentorius"
    )
    percentage = models.IntegerField(
        verbose_name="Procentai",
        help_text="Vertinimas procentais (0-100)",
        validators=[
            MinValueValidator(0, "Procentai negali būti mažiau nei 0"),
            MaxValueValidator(100, "Procentai negali būti daugiau nei 100")
        ]
    )
    notes = models.TextField(blank=True, verbose_name="Pastabos")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Sukurta")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atnaujinta")

    class Meta:
        verbose_name = "Pažymys"
        verbose_name_plural = "Pažymiai"
        ordering = ['-created_at']
        unique_together = ['student', 'lesson']

    def __str__(self):
        return f"{self.student} - {self.lesson} - {self.percentage}%"

    @property
    def grade_letter(self):
        """
        Konvertuoja procentus į vertinimo raidę
        """
        if self.percentage < 40:
            return "-"
        elif self.percentage < 55:
            return "s"
        elif self.percentage < 75:
            return "b"
        elif self.percentage < 85:
            return "p"
        else:
            return "a"

    @property
    def grade_description(self):
        """
        Grąžina vertinimo aprašymą
        """
        grade_descriptions = {
            "-": "Neatsiskaityta",
            "s": "Slenkstinis",
            "b": "Bazinis", 
            "p": "Pažengęs",
            "a": "Aukštesnysis"
        }
        return grade_descriptions.get(self.grade_letter, "Nežinomas")

    def clean(self):
        """
        Validacija - tikrinama ar mentorius ir mokinys turi teisingas roles
        """
        from django.core.exceptions import ValidationError
        
        if self.mentor.role != 'mentor':
            raise ValidationError("Tik mentorius gali duoti pažymius")
        
        if self.student.role != 'student':
            raise ValidationError("Pažymys gali būti duotas tik mokiniui")

class Competency(models.Model):
    """
    Kompetencijų modelis - mokinių kompetencijos
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
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

class Focus(models.Model):
    """
    Dėmesio krypčių modelis - pamokų dėmesio kryptys
    """
    name = models.CharField(max_length=255, unique=True, verbose_name="Pavadinimas")
    description = models.TextField(blank=True, verbose_name="Aprašymas")
    
    class Meta:
        verbose_name = "Dėmesio kryptis"
        verbose_name_plural = "Dėmesio kryptys"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Lesson(models.Model):
    """
    Pamokų modelis - ugdymo planų šablonai
    """
    title = models.CharField(max_length=200, verbose_name="Pavadinimas")
    subject = models.ForeignKey(
        Subject, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
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
    description = models.TextField(blank=True, verbose_name="Aprašymas")
    assessment_criteria = models.TextField(blank=True, verbose_name="Vertinimo kriterijai")
    topic = models.ForeignKey(
        Topic, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Tema"
    )
    objectives = models.ManyToManyField(
        Objective, 
        blank=True,
        verbose_name="Tikslai"
    )
    components = models.ManyToManyField(
        Component, 
        blank=True,
        verbose_name="Komponentai"
    )
    skills = models.ManyToManyField(
        Skill, 
        blank=True,
        verbose_name="Gebėjimai"
    )
    # grades field removed - now grades are stored separately in Grade model
    competencies = models.ManyToManyField(
        Competency, 
        blank=True,
        verbose_name="Kompetencijos"
    )
    virtues = models.ManyToManyField(
        Virtue, 
        blank=True,
        verbose_name="Dorybės"
    )
    focus = models.ManyToManyField(
        Focus, 
        blank=True,
        verbose_name="Dėmesio kryptys"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Sukurta")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atnaujinta")

    class Meta:
        verbose_name = "Pamoka"
        verbose_name_plural = "Pamokos"
        ordering = ['-created_at']

    def __str__(self):
        return self.title