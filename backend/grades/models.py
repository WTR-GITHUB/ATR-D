# backend/grades/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _


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
        'curriculum.Lesson',
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
        Konvertuoja procentus į raidžių vertinimą
        """
        if self.percentage >= 90:
            return "A"
        elif self.percentage >= 80:
            return "B"
        elif self.percentage >= 70:
            return "C"
        elif self.percentage >= 60:
            return "D"
        elif self.percentage >= 50:
            return "E"
        else:
            return "F"

    @property
    def grade_description(self):
        """
        Grąžina vertinimo aprašymą
        """
        if self.percentage >= 90:
            return "Puikiai"
        elif self.percentage >= 80:
            return "Labai gerai"
        elif self.percentage >= 70:
            return "Gerai"
        elif self.percentage >= 60:
            return "Patenkinamai"
        elif self.percentage >= 50:
            return "Silpnai"
        else:
            return "Nepatenkinamai"

    def clean(self):
        from django.core.exceptions import ValidationError
        
        # Tikriname, ar studentas yra studentas
        if not self.student.has_role('student'):
            raise ValidationError("Pažymys gali būti duotas tik mokiniui")
        
        # Tikriname, ar mentorius yra mentorius
        if not self.mentor.has_role('mentor'):
            raise ValidationError("Pažymį gali duoti tik mentorius")
        
        # Tikriname, ar studentas ir mentorius nėra tas pats asmuo
        if self.student == self.mentor:
            raise ValidationError("Studentas ir mentorius negali būti tas pats asmuo")
