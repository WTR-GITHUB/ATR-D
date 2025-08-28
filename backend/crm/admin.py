# /backend/crm/admin.py
from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)

# Relationship Models Admin
@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    """
    Mokinio-tėvų santykio administravimo klasė
    """
    list_display = ('student', 'parent')
    list_filter = ('student__roles', 'parent__roles')
    search_fields = ('student__email', 'parent__email', 'student__first_name', 'parent__first_name')

@admin.register(StudentCurator)
class StudentCuratorAdmin(admin.ModelAdmin):
    """
    Mokinio-kuratoriaus santykio administravimo klasė
    """
    list_display = ('student', 'curator', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date', 'student__roles', 'curator__roles')
    search_fields = ('student__email', 'curator__email', 'student__first_name', 'curator__first_name')

@admin.register(StudentSubjectLevel)
class StudentSubjectLevelAdmin(admin.ModelAdmin):
    """
    Mokinio dalyko lygio administravimo klasė
    """
    list_display = ('student', 'subject', 'level')
    list_filter = ('subject', 'level', 'student__roles')
    search_fields = ('student__email', 'student__first_name', 'subject__name')

@admin.register(MentorSubject)
class MentorSubjectAdmin(admin.ModelAdmin):
    """
    Mentoriaus dalyko administravimo klasė
    """
    list_display = ('mentor', 'subject')
    list_filter = ('subject', 'mentor__roles')
    search_fields = ('mentor__email', 'mentor__first_name', 'subject__name')




