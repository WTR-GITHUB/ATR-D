from django.contrib import admin
from .models import Period, Classroom, GlobalSchedule


@admin.register(Period)
class PeriodAdmin(admin.ModelAdmin):
    """
    Periodų admin - valdo periodų administravimą
    """
    list_display = ['starttime', 'endtime', 'duration']
    list_filter = ['duration']
    search_fields = ['starttime', 'endtime']
    ordering = ['starttime']


@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    """
    Klasės admin - valdo klasės administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(GlobalSchedule)
class GlobalScheduleAdmin(admin.ModelAdmin):
    """
    Globalaus tvarkaraščio admin - valdo tvarkaraščio administravimą
    """
    list_display = ['date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user']
    list_filter = ['date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user']
    search_fields = ['date', 'weekday', 'user__first_name', 'user__last_name', 'subject__name']
    ordering = ['date', 'period__starttime']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('date', 'weekday', 'period', 'classroom')
        }),
        ('Pamokos informacija', {
            'fields': ('subject', 'level', 'lesson', 'user')
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimizuojame queryset su select_related
        """
        return super().get_queryset(request).select_related(
            'period', 'classroom', 'subject', 'level', 'lesson', 'user'
        )
