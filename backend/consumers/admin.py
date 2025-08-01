from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User,
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)
from lessons.models import Subject, Level

@admin.register(User)
class CustomUserAdmin(UserAdmin):
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

@admin.register(StudentParent)
class StudentParentAdmin(admin.ModelAdmin):
    list_display = ('student', 'parent')
    list_filter = ('student__role', 'parent__role')
    search_fields = ('student__email', 'parent__email', 'student__first_name', 'parent__first_name')

@admin.register(StudentCurator)
class StudentCuratorAdmin(admin.ModelAdmin):
    list_display = ('student', 'curator', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date', 'student__role', 'curator__role')
    search_fields = ('student__email', 'curator__email', 'student__first_name', 'curator__first_name')



@admin.register(StudentSubjectLevel)
class StudentSubjectLevelAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'level')
    list_filter = ('subject', 'level', 'student__role')
    search_fields = ('student__email', 'student__first_name', 'subject__name')

@admin.register(MentorSubject)
class MentorSubjectAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'subject')
    list_filter = ('subject', 'mentor__role')
    search_fields = ('mentor__email', 'mentor__first_name', 'subject__name')
