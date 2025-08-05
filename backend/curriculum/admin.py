from django.contrib import admin
from .models import Subject, Level, Objective, Component, Skill, Competency, Virtue, CompetencyAtcheve, Lesson


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    """
    Dalykų admin - valdo dalykų administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    """
    Mokymo lygių admin - valdo mokymo lygių administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    """
    Tikslų admin - valdo tikslų administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    """
    Komponentų admin - valdo komponentų administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """
    Gebėjimų admin - valdo gebėjimų administravimą
    """
    list_display = ['name', 'code', 'subject', 'description']
    list_filter = ['subject', 'name']
    search_fields = ['name', 'code', 'description', 'subject__name']
    ordering = ['name']


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    """
    Kompetencijų admin - valdo kompetencijų administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Virtue)
class VirtueAdmin(admin.ModelAdmin):
    """
    Dorybių admin - valdo dorybių administravimą
    """
    list_display = ['name', 'description']
    list_filter = ['name']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(CompetencyAtcheve)
class CompetencyAtcheveAdmin(admin.ModelAdmin):
    """
    BUP Kompetencijų admin - valdo kompetencijų pasiekimų administravimą
    """
    list_display = ['competency', 'subject', 'get_virtues_display']
    list_filter = ['subject', 'competency']
    search_fields = ['competency__name', 'subject__name']
    ordering = ['competency__name']
    
    def get_virtues_display(self, obj):
        return ', '.join([v.name for v in obj.virtues.all()])
    get_virtues_display.short_description = 'Dorybės'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """
    Pamokų admin - valdo pamokų administravimą
    """
    list_display = ['title', 'subject', 'mentor', 'topic', 'created_at']
    list_filter = ['subject', 'mentor', 'created_at']
    search_fields = ['title', 'topic', 'description', 'subject__name', 'mentor__first_name', 'mentor__last_name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('title', 'subject', 'mentor', 'topic', 'description')
        }),
        ('Pamokos komponentai', {
            'fields': ('levels', 'objectives', 'components', 'skills', 'competencies', 'virtues', 'focus')
        }),
        ('Vertinimo kriterijai', {
            'fields': ('assessment_criteria',)
        }),
        ('Pasiekimo lygiai', {
            'fields': ('slenkstinis', 'bazinis', 'pagrindinis', 'aukstesnysis')
        }),
        ('BUP Kompetencijos', {
            'fields': ('competency_atcheves',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimizuojame queryset su select_related
        """
        return super().get_queryset(request).select_related('subject', 'mentor')
