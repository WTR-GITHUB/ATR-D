# /backend/crm/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator

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
        if not self.student.has_role('student'):
            raise ValidationError(_('Selected user must have Student role'))
        if not self.parent.has_role('parent'):
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
        if not self.student.has_role('student'):
            raise ValidationError(_('Selected user must have Student role'))
        if not self.curator.has_role('curator'):
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
        'curriculum.Subject', 
        on_delete=models.CASCADE,
        verbose_name=_('subject')
    )
    level = models.ForeignKey(
        'curriculum.Level', 
        on_delete=models.CASCADE,
        verbose_name=_('level')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if not self.student.has_role('student'):
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
        'curriculum.Subject', 
        on_delete=models.CASCADE,
        verbose_name=_('subject')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    def clean(self):
        if not self.mentor.has_role('mentor'):
            raise ValidationError(_('Selected user must have Mentor role'))

    class Meta:
        verbose_name = _('mentor subject')
        verbose_name_plural = _('mentor subjects')
        # CHANGE: Pašalintas unique_together apribojimas, kad tą patį dalyką galėtų mokyti keli mentoriai

    def __str__(self):
        return f"{self.mentor} - {self.subject}"






