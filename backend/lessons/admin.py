from django.contrib import admin
from .models import (
    Subject, Level, Topic, Objective, Component, Skill,
    Competency, Virtue, Focus, Lesson, Grade
)

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Objective)
class ObjectiveAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Component)
class ComponentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Virtue)
class VirtueAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Focus)
class FocusAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)
    ordering = ('name',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'mentor', 'subject', 'created_at')
    list_filter = ('subject', 'mentor__role', 'created_at')
    search_fields = ('title', 'mentor__email', 'mentor__first_name', 'subject__name')
    filter_horizontal = ('levels', 'objectives', 'components', 'skills', 'competencies', 'virtues', 'focus')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'mentor', 'percentage', 'grade_letter', 'grade_description', 'created_at')
    list_filter = ('percentage', 'created_at', 'student__role', 'mentor__role')
    search_fields = ('student__email', 'student__first_name', 'lesson__title', 'mentor__email')
    readonly_fields = ('grade_letter', 'grade_description', 'created_at', 'updated_at')
    ordering = ('-created_at',)
