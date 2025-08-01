from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

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
        extra_fields.setdefault('role', User.Role.ADMIN)

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

# Student-Parent Relationship Model
class StudentParent(models.Model):
    """
    Mokinio-tėvų santykio modelis - saugo mokinių ir tėvų ryšius
    """
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

# Student-Curator Relationship Model
class StudentCurator(models.Model):
    """
    Mokinio-kuratoriaus santykio modelis - saugo mokinių ir kuratorių ryšius
    """
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

# Student Subject Level Model
class StudentSubjectLevel(models.Model):
    """
    Mokinio dalyko lygio modelis - saugo mokinių dalykų ir lygių informaciją
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subject_levels',
        verbose_name=_('student')
    )
    subject = models.ForeignKey(
        'Subject', 
        on_delete=models.CASCADE,
        verbose_name=_('subject')
    )
    level = models.ForeignKey(
        'Level', 
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

# Mentor Subject Model
class MentorSubject(models.Model):
    """
    Mentoriaus dalyko modelis - saugo mentorių dalykų informaciją
    """
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mentor_subjects',
        verbose_name=_('mentor')
    )
    subject = models.ForeignKey(
        'Subject', 
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

# Grade Model
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
        if self.percentage is None:
            return "-"
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
        if self.percentage is None:
            return "Neatsiskaityta"
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

# Subject Model
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

# Level Model
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

# Topic Model
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

# Objective Model
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

# Component Model
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

# Skill Model
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

# Competency Model
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

# Virtue Model
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

# Focus Model
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

# Lesson Model
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
