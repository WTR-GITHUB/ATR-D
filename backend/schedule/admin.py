# backend/schedule/admin.py
from django.contrib import admin
from django import forms
from django.contrib.auth import get_user_model
from .models import Period, Classroom, GlobalSchedule


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    """
    Periodų admin - valdo periodų administravimą
    """
    list_display = ['name', 'starttime', 'endtime', 'duration']
    list_filter = ['duration']
    search_fields = ['name', 'starttime', 'endtime']
    ordering = ['name']


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    """
    Klasės admin - valdo klasės administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


class GlobalScheduleForm(forms.ModelForm):
    """
    Custom forma GlobalSchedule modeliui - apriboja vartotojus tik mentoriais
    """
    class Meta:
        model = GlobalSchedule
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Apribojame user lauką tik mentoriais
        User = get_user_model()
        # Filtruojame vartotojus, kurie turi mentor rolę
        mentors = [user for user in User.objects.all() if user.has_role('mentor')]
        self.fields['user'].queryset = User.objects.filter(id__in=[user.id for user in mentors])


@admin.register(GlobalSchedule)
class GlobalScheduleAdmin(admin.ModelAdmin):
    """
    Globalaus tvarkaraščio admin - valdo tvarkaraščio administravimą
    """
    form = GlobalScheduleForm
    list_display = ['date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user']
    list_filter = ['date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user']
    search_fields = ['date', 'weekday', 'user__first_name', 'user__last_name', 'subject__name']
    ordering = ['date', 'period__starttime']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('date', 'period', 'classroom')
        }),
        ('Pamokos informacija', {
            'fields': ('subject', 'level', 'user')
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimizuojame queryset su select_related
        """
        return super().get_queryset(request).select_related(
            'period', 'classroom', 'subject', 'level', 'user'
        )
