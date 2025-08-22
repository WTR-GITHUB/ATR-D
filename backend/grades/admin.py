# backend/grades/admin.py

# Grades aplikacijos admin panelės konfigūracija
# CHANGE: Pridėti nauji modeliai AchievementLevel ir atnaujintas Grade

from django.contrib import admin
from django.utils.html import format_html
from .models import AchievementLevel, Grade, GradeCalculation


@admin.register(AchievementLevel)
class AchievementLevelAdmin(admin.ModelAdmin):
    """
    Pasiekimų lygių administravimas
    """
    list_display = ['code', 'name', 'min_percentage', 'max_percentage', 'color', 'description_preview']
    list_editable = ['min_percentage', 'max_percentage', 'color']
    search_fields = ['code', 'name']
    ordering = ['min_percentage']
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('code', 'name', 'description')
        }),
        ('Procentų intervalai', {
            'fields': ('min_percentage', 'max_percentage'),
            'description': 'Nustatykite procentų intervalus šiam pasiekimų lygiui'
        }),
        ('Dizainas', {
            'fields': ('color',),
            'description': 'Spalva, kuri bus naudojama frontend\'e'
        }),
    )
    
    def description_preview(self, obj):
        """Rodo aprašymo peržiūrą"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_preview.short_description = 'Aprašymas'


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    """
    Mokinių vertinimų administravimas
    CHANGE: Atnaujintas su naujais laukais
    """
    list_display = [
        'student', 'lesson', 'mentor', 'achievement_level', 
        'percentage', 'imu_plan_info', 'created_at'
    ]
    list_filter = [
        'achievement_level', 'created_at', 'updated_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name',
        'lesson__title', 'mentor__first_name', 'mentor__last_name'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Mokinio informacija', {
            'fields': ('student', 'lesson', 'mentor')
        }),
        ('Vertinimas', {
            'fields': ('achievement_level', 'percentage'),
            'description': 'Pasiekimų lygis automatiškai nustatomas pagal procentus'
        }),
        ('Susiejimas', {
            'fields': ('imu_plan',),
            'description': 'Susiejimas su individualiu mokinio ugdymo planu'
        }),
        ('Papildoma informacija', {
            'fields': ('notes',)
        }),
        ('Laiko informacija', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def imu_plan_info(self, obj):
        """Rodo IMU plano informaciją"""
        if obj.imu_plan:
            return format_html(
                '<span style="color: green;">✓ Susietas</span>'
            )
        return format_html(
            '<span style="color: orange;">- Nesusietas</span>'
        )
    imu_plan_info.short_description = 'IMU Planas'
    
    def get_queryset(self, request):
        """Optimizuojame užklausas"""
        return super().get_queryset(request).select_related(
            'student', 'lesson', 'mentor', 'achievement_level', 'imu_plan'
        )


@admin.register(GradeCalculation)
class GradeCalculationAdmin(admin.ModelAdmin):
    """
    Pasiekimų lygių skaičiavimų istorijos administravimas
    CHANGE: Naujas admin modelis skaičiavimų sekimui
    """
    list_display = ['percentage', 'calculated_level', 'calculation_date']
    list_filter = ['calculated_level', 'calculation_date']
    search_fields = ['percentage']
    ordering = ['-calculation_date']
    readonly_fields = ['calculation_date']
    
    fieldsets = (
        ('Skaičiavimo duomenys', {
            'fields': ('percentage', 'calculated_level')
        }),
        ('Laiko informacija', {
            'fields': ('calculation_date',)
        }),
    )
    
    def has_add_permission(self, request):
        """Neleidžiame rankiniu būdu kurti skaičiavimų"""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Neleidžiame keisti skaičiavimų"""
        return False
