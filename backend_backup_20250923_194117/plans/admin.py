# backend/plans/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import LessonSequence, LessonSequenceItem, IMUPlan


class LessonSequenceItemInline(admin.TabularInline):
    """
    Sekos elementų redagavimas inline
    """
    model = LessonSequenceItem
    extra = 1
    ordering = ['position']


@admin.register(LessonSequence)
class LessonSequenceAdmin(admin.ModelAdmin):
    """
    Pamokų sekos administravimas
    """
    list_display = ['name', 'subject', 'level', 'created_by', 'is_active', 'created_at']
    list_filter = ['subject', 'level', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'subject__name', 'level__name']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('name', 'description', 'subject', 'level')
        }),
        ('Sistemos informacija', {
            'fields': ('created_by', 'is_active', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(LessonSequenceItem)
class LessonSequenceItemAdmin(admin.ModelAdmin):
    """
    Sekos elementų administravimas
    """
    list_display = ['sequence', 'lesson', 'position']
    list_filter = ['sequence', 'lesson__subject']
    ordering = ['sequence', 'position']
    
    def subject(self, obj):
        return obj.lesson.subject.name if obj.lesson else '-'
    subject.short_description = 'Dalykas'
    
    def level(self, obj):
        return obj.lesson.levels.first().name if obj.lesson and obj.lesson.levels.exists() else '-'
    level.short_description = 'Lygis'


@admin.register(IMUPlan)
class IMUPlanAdmin(admin.ModelAdmin):
    """
    Individualių mokinių ugdymo planų administravimas
    REFAKTORINIMAS: Pašalinti plan_status, started_at, completed_at - perkelta į GlobalSchedule
    """
    list_display = [
        'student', 'lesson', 'global_schedule_display', 
        # REFAKTORINIMAS: Lankomumo statusas paliekamas
        'attendance_status',
        'created_at'
    ]
    list_filter = [
        # REFAKTORINIMAS: Lankomumo statusas paliekamas
        'attendance_status',
        'global_schedule__subject', 'global_schedule__level',
        'global_schedule__date', 'created_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'student__email',
        'lesson__title', 'global_schedule__classroom__name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'global_schedule__date'
    
    def global_schedule_display(self, obj):
        """Rodo globalaus tvarkaraščio informaciją"""
        schedule = obj.global_schedule
        return format_html(
            '{} {} {} - {}',
            schedule.date,
            schedule.period,
            schedule.classroom,
            schedule.subject
        )
    global_schedule_display.short_description = 'Veikla'
    
    def get_queryset(self, request):
        """Optimizuojame užklausą"""
        return super().get_queryset(request).select_related(
            'student', 'lesson', 'global_schedule__period', 
            'global_schedule__classroom', 'global_schedule__subject'
        )
