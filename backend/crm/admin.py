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
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtruoja student ir parent laukus pagal jų roles
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if db_field.name == "student":
            # CHANGE: Filtruojame tik vartotojus su 'student' role
            kwargs["queryset"] = User.objects.filter(roles__contains='student')
        elif db_field.name == "parent":
            # CHANGE: Filtruojame tik vartotojus su 'parent' role
            kwargs["queryset"] = User.objects.filter(roles__contains='parent')
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(StudentCurator)
class StudentCuratorAdmin(admin.ModelAdmin):
    """
    Mokinio-kuratoriaus santykio administravimo klasė
    """
    list_display = ('student', 'curator', 'start_date', 'end_date')
    list_filter = ('start_date', 'end_date', 'student__roles', 'curator__roles')
    search_fields = ('student__email', 'curator__email', 'student__first_name', 'curator__first_name')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtruoja student ir curator laukus pagal jų roles
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if db_field.name == "student":
            # CHANGE: Filtruojame tik vartotojus su 'student' role
            kwargs["queryset"] = User.objects.filter(roles__contains='student')
        elif db_field.name == "curator":
            # CHANGE: Filtruojame tik vartotojus su 'curator' role
            kwargs["queryset"] = User.objects.filter(roles__contains='curator')
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(StudentSubjectLevel)
class StudentSubjectLevelAdmin(admin.ModelAdmin):
    """
    Mokinio dalyko lygio administravimo klasė
    """
    list_display = ('student', 'subject', 'level')
    list_filter = ('subject', 'level', 'student__roles')
    search_fields = ('student__email', 'student__first_name', 'subject__name')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtruoja student lauką pagal role
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if db_field.name == "student":
            # CHANGE: Filtruojame tik vartotojus su 'student' role
            kwargs["queryset"] = User.objects.filter(roles__contains='student')
        
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(MentorSubject)
class MentorSubjectAdmin(admin.ModelAdmin):
    """
    Mentoriaus dalyko administravimo klasė
    """
    list_display = ('mentor', 'subject')
    list_filter = ('subject', 'mentor__roles')
    search_fields = ('mentor__email', 'mentor__first_name', 'subject__name')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtruoja mentor lauką, kad rodytų tik vartotojus su 'mentor' role
        """
        if db_field.name == "mentor":
            # CHANGE: Filtruojame tik vartotojus su 'mentor' role
            from django.contrib.auth import get_user_model
            User = get_user_model()
            kwargs["queryset"] = User.objects.filter(roles__contains='mentor')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)




