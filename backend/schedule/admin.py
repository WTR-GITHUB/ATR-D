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
    REFAKTORINIMAS: Pridėti plan_status, started_at, completed_at laukai
    """
    form = GlobalScheduleForm
    list_display = [
        'date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user',
        # REFAKTORINIMAS: Pridėti planų valdymo laukai
        'plan_status', 'started_at', 'completed_at'
    ]
    list_filter = [
        'date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user',
        # REFAKTORINIMAS: Pridėti planų valdymo filtrai
        'plan_status'
    ]
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
        # REFAKTORINIMAS: Pridėti planų valdymo laukai
        ('Plano valdymas', {
            'fields': ('plan_status', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimizuojame queryset su select_related
        """
        return super().get_queryset(request).select_related(
            'period', 'classroom', 'subject', 'level', 'user'
        )
    
    # REFAKTORINIMAS: Pridėti veiklos valdymo veiksmai
    actions = ['start_activity', 'end_activity']
    
    def start_activity(self, request, queryset):
        """
        REFAKTORINIMAS: Pradeda pasirinktas veiklas
        """
        started_count = 0
        for schedule in queryset:
            if schedule.plan_status == 'planned':
                result = GlobalSchedule.bulk_start_activity(schedule.id)
                if result['updated_count'] > 0:
                    started_count += 1
        
        if started_count > 0:
            self.message_user(request, f"Sėkmingai pradėta {started_count} veikla")
        else:
            self.message_user(request, "Nėra veiklų, kurias galima pradėti")
    
    start_activity.short_description = "Pradėti pasirinktas veiklas"
    
    def end_activity(self, request, queryset):
        """
        REFAKTORINIMAS: Baigia pasirinktas veiklas
        """
        ended_count = 0
        for schedule in queryset:
            if schedule.plan_status == 'in_progress':
                result = GlobalSchedule.bulk_end_activity(schedule.id)
                if result['updated_count'] > 0:
                    ended_count += 1
        
        if ended_count > 0:
            self.message_user(request, f"Sėkmingai baigta {ended_count} veikla")
        else:
            self.message_user(request, "Nėra veiklų, kurias galima baigti")
    
    end_activity.short_description = "Baigti pasirinktas veiklas"
