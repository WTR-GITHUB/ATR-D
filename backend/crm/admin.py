from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User,
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject,
    Grade,
    Subject,
    Level,
    Topic,
    Objective,
    Component,
    Skill,
    Competency,
    Virtue,
    Focus,
    Lesson
)

# User Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Vartotojų administravimo klasė - valdo vartotojų sąrašą ir redagavimą
    """
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'birth_date', 'phone_number')}),
        (_('Role and Contract'), {'fields': ('role', 'contract_number')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role'),
        }),
    )

# Relationship Models Admin
@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    """
    Mokinio-tėvų santykio administravimo klasė
    """
    list_display = ('student', 'parent')
    list_filter = ('student__role', 'parent__role')
    search_fields = ('student__email', 'parent__email', 'student__first_name', 'parent__first_name')

@admin.register(StudentCurator)
class StudentCuratorAdmin(admin.ModelAdmin):
    """
    Mokinio-kuratoriaus santykio administravimo klasė
    """
    list_display = ('student', 'curator', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date', 'student__role', 'curator__role')
    search_fields = ('student__email', 'curator__email', 'student__first_name', 'curator__first_name')

@admin.register(StudentSubjectLevel)
class StudentSubjectLevelAdmin(admin.ModelAdmin):
    """
    Mokinio dalyko lygio administravimo klasė
    """
    list_display = ('student', 'subject', 'level')
    list_filter = ('subject', 'level', 'student__role')
    search_fields = ('student__email', 'student__first_name', 'subject__name')

@admin.register(MentorSubject)
class MentorSubjectAdmin(admin.ModelAdmin):
    """
    Mentoriaus dalyko administravimo klasė
    """
    list_display = ('mentor', 'subject')
    list_filter = ('subject', 'mentor__role')
    search_fields = ('mentor__email', 'mentor__first_name', 'subject__name')

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    """
    Pažymių administravimo klasė
    """
    list_display = ('student', 'lesson', 'mentor', 'percentage', 'grade_letter', 'grade_description', 'created_at')
    list_filter = ('percentage', 'created_at', 'student__role', 'mentor__role')
    search_fields = ('student__email', 'student__first_name', 'lesson__title', 'mentor__email')
    readonly_fields = ('grade_letter', 'grade_description', 'created_at', 'updated_at')
    ordering = ('-created_at',)

# Lesson Components Admin
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """
    Dalykų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    """
    Mokymo lygių administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    """
    Temų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    """
    Tikslų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    """
    Komponentų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """
    Gebėjimų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    """
    Kompetencijų administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Virtue)
class VirtueAdmin(admin.ModelAdmin):
    """
    Dorybių administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Focus)
class FocusAdmin(admin.ModelAdmin):
    """
    Dėmesio krypčių administravimo klasė
    """
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """
    Pamokų administravimo klasė
    """
    list_display = ('title', 'mentor', 'subject', 'created_at')
    list_filter = ('subject', 'mentor__role', 'created_at')
    search_fields = ('title', 'mentor__email', 'mentor__first_name', 'subject__name')
    filter_horizontal = ('levels', 'objectives', 'components', 'skills', 'competencies', 'virtues', 'focus')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
