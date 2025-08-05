from django.contrib import admin
from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    """
    Pažymių administravimo klasė
    """
    list_display = ('student', 'lesson', 'mentor', 'percentage', 'grade_letter', 'grade_description', 'created_at')
    list_filter = ('percentage', 'created_at', 'student__roles', 'mentor__roles')
    search_fields = ('student__email', 'student__first_name', 'lesson__title', 'mentor__email')
    readonly_fields = ('grade_letter', 'grade_description', 'created_at', 'updated_at')
    ordering = ('-created_at',)
