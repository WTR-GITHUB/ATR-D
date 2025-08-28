# /backend/curriculum/admin.py
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
    Pamokų admin - valdo pamokų administravimą su soft delete funkcionalumu
    """
    list_display = ['title', 'subject', 'mentor', 'topic', 'is_deleted', 'deleted_at', 'created_at']
    list_filter = ['subject', 'mentor', 'created_at', 'is_deleted']
    search_fields = ['title', 'topic', 'content', 'subject__name', 'mentor__first_name', 'mentor__last_name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    # Pridedame actions
    actions = ['restore_lessons', 'hard_delete_lessons', 'soft_delete_lessons']
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('title', 'subject', 'mentor', 'topic', 'content')
        }),
        ('Pamokos komponentai', {
            'fields': ('levels', 'objectives', 'components', 'skills', 'virtues', 'focus')
        }),
        ('Pasiekimo lygiai', {
            'fields': ('slenkstinis', 'bazinis', 'pagrindinis', 'aukstesnysis')
        }),
        ('BUP Kompetencijos', {
            'fields': ('competency_atcheves',)
        }),
        ('Būsena', {
            'fields': ('is_deleted', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """
        Optimizuojame queryset su select_related ir rodome visas pamokas
        """
        return super().get_queryset(request).select_related('subject', 'mentor')
    
    def restore_lessons(self, request, queryset):
        """
        Atkurti ištrintas pamokas
        """
        restored_count = queryset.filter(is_deleted=True).update(
            is_deleted=False, 
            deleted_at=None
        )
        self.message_user(
            request, 
            f'Sėkmingai atkurta {restored_count} pamokų'
        )
    restore_lessons.short_description = "Atkurti ištrintas pamokas"
    
    def hard_delete_lessons(self, request, queryset):
        """
        Sunkus trynimas - tik ištrintoms pamokoms
        """
        # Filtruojame tik ištrintas pamokas
        deleted_lessons = queryset.filter(is_deleted=True)
        deleted_count = deleted_lessons.count()
        
        if deleted_count > 0:
            deleted_lessons.delete()  # Sunkus trynimas
            self.message_user(
                request, 
                f'Sėkmingai sunku ištrinta {deleted_count} ištrintų pamokų'
            )
        else:
            self.message_user(
                request, 
                'Nėra ištrintų pamokų sunku ištrinti'
            )
    hard_delete_lessons.short_description = "Sunkiai ištrinti ištrintas pamokas"
    
    def soft_delete_lessons(self, request, queryset):
        """
        Soft delete - pažymėti pamokas kaip ištrintas
        """
        active_lessons = queryset.filter(is_deleted=False)
        deleted_count = active_lessons.count()
        
        if deleted_count > 0:
            from django.utils import timezone
            active_lessons.update(
                is_deleted=True, 
                deleted_at=timezone.now()
            )
            self.message_user(
                request, 
                f'Sėkmingai pažymėta kaip ištrinta {deleted_count} pamokų'
            )
        else:
            self.message_user(
                request, 
                'Nėra aktyvių pamokų ištrinti'
            )
    soft_delete_lessons.short_description = "Pažymėti pamokas kaip ištrintas"
    
    def get_actions(self, request):
        """
        Pridedame actions į admin
        """
        actions = super().get_actions(request)
        if 'delete_selected' in actions:
            del actions['delete_selected']  # Pašaliname standartinį trynimą
        return actions
