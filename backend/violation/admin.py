# backend/violation/admin.py

# Django admin configuration for violation management system
# Provides admin interface for managing violations, categories, types, and penalty ranges
# CHANGE: Created comprehensive admin interface for violation system with penalty logic

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import ViolationCategory, ViolationRange, Violation


@admin.register(ViolationCategory)
class ViolationCategoryAdmin(admin.ModelAdmin):
    """
    Admin konfigūracija pažeidimų kategorijoms
    """
    list_display = ['name', 'color_type_preview', 'description_short', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('name', 'description', 'color_type', 'is_active')
        }),
        ('Sistemos informacija', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def description_short(self, obj):
        """Rodo trumpą aprašymą"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = 'Aprašymas'
    
    def color_type_preview(self, obj):
        """Rodo spalvos tipo peržiūrą"""
        # Spalvų žemėlapis pagal examples/spalvos failą
        color_map = {
            'DEFAULT': {'bg': 'bg-white', 'border': 'border-gray-300', 'color': '#6b7280'},
            'RED': {'bg': 'bg-red-50', 'border': 'border-red-600', 'color': '#dc2626'},
            'BLUE': {'bg': 'bg-blue-50', 'border': 'border-blue-600', 'color': '#2563eb'},
            'YELLOW': {'bg': 'bg-yellow-50', 'border': 'border-yellow-600', 'color': '#d97706'},
            'ORANGE': {'bg': 'bg-orange-50', 'border': 'border-orange-600', 'color': '#ea580c'},
            'PURPLE': {'bg': 'bg-purple-50', 'border': 'border-purple-600', 'color': '#9333ea'},
            'GREEN': {'bg': 'bg-green-50', 'border': 'border-green-600', 'color': '#16a34a'},
            'DARK_GREEN': {'bg': 'bg-green-100', 'border': 'border-green-800', 'color': '#166534'},
            'AMBER': {'bg': 'bg-amber-50', 'border': 'border-amber-600', 'color': '#d97706'},
            'DARK_RED': {'bg': 'bg-red-100', 'border': 'border-red-800', 'color': '#991b1b'},
        }
        
        color_info = color_map.get(obj.color_type, color_map['DEFAULT'])
        
        return format_html(
            '<div style="display: flex; align-items: center; gap: 8px;">'
            '<div style="width: 20px; height: 20px; background-color: {}; border: 2px solid {}; border-radius: 3px;"></div>'
            '<span style="font-size: 12px; font-weight: 500;">{}</span>'
            '</div>',
            color_info['color'] + '20',  # 20% opacity
            color_info['color'],
            obj.get_color_type_display()
        )
    color_type_preview.short_description = 'Spalvos tipas'




@admin.register(ViolationRange)
class ViolationRangeAdmin(admin.ModelAdmin):
    """
    Admin konfigūracija pažeidimų rėžiams mokesčių skaičiavimui
    """
    list_display = ['name', 'range_display', 'penalty_amount', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    ordering = ['min_violations']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Rėžio konfigūracija', {
            'fields': ('name', 'min_violations', 'max_violations', 'penalty_amount', 'is_active'),
            'description': 'Nustatykite pažeidimų rėžius ir mokesčių dydžius. Pvz.: 1-7 pažeidimai = 0€, 8+ pažeidimai = 1€'
        }),
        ('Sistemos informacija', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def range_display(self, obj):
        """Rodo rėžio aprašymą"""
        if obj.max_violations:
            return f"{obj.min_violations}-{obj.max_violations} pažeidimai"
        else:
            return f"{obj.min_violations}+ pažeidimai"
    range_display.short_description = 'Rėžis'


@admin.register(Violation)
class ViolationAdmin(admin.ModelAdmin):
    """
    Admin konfigūracija pažeidimams/skoloms
    """
    list_display = [
        'student_name', 'category', 'todos_preview', 
        'status_display', 'penalty_status_display', 'violation_count',
        'penalty_amount', 'created_at'
    ]
    list_filter = [
        'status', 'penalty_status', 'category', 'created_at', 'task_completed_at', 'penalty_paid_at'
    ]
    search_fields = [
        'student__first_name', 'student__last_name', 'student__email',
        'description', 'category'
    ]
    ordering = ['-created_at']
    readonly_fields = [
        'violation_count', 'penalty_amount', 'created_at', 'updated_at',
        'task_completed_at', 'penalty_paid_at'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Pagrindinė informacija', {
            'fields': ('student', 'category', 'todos', 'description')
        }),
        ('Statusai', {
            'fields': ('status', 'penalty_status')
        }),
        ('Pažeidimų skaičiavimas', {
            'fields': ('violation_count', 'penalty_amount'),
            'description': 'Automatiškai skaičiuojami pagal mokinio pažeidimų skaičių'
        }),
        ('Mokėjimo datos', {
            'fields': ('task_completed_at', 'penalty_paid_at'),
            'classes': ('collapse',)
        }),
        ('Papildoma informacija', {
            'fields': ('created_by', 'notes')
        }),
        ('Sistemos informacija', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_penalty_as_paid', 'recalculate_penalties']
    
    def student_name(self, obj):
        """Rodo mokinio vardą ir pavardę"""
        return obj.student.get_full_name()
    student_name.short_description = 'Mokinys'
    student_name.admin_order_field = 'student__first_name'
    
    def todos_preview(self, obj):
        """Rodo todos sąrašo peržiūrą"""
        if not obj.todos:
            return '-'
        
        completed = len([todo for todo in obj.todos if todo.get('completed', False)])
        total = len(obj.todos)
        
        return format_html(
            '<span style="font-size: 12px;">{}/{} užduotys</span>',
            completed, total
        )
    todos_preview.short_description = 'Užduotys'
    
    def status_display(self, obj):
        """Rodo statusą su spalvų kodavimu"""
        colors = {
            'pending': 'orange',
            'completed': 'green'
        }
        color = colors.get(obj.status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_display.short_description = 'Užduoties statusas'
    status_display.admin_order_field = 'status'
    
    def penalty_status_display(self, obj):
        """Rodo mokesčio statusą su spalvų kodavimu"""
        colors = {
            'unpaid': 'red',
            'paid': 'green'
        }
        color = colors.get(obj.penalty_status, 'black')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_penalty_status_display()
        )
    penalty_status_display.short_description = 'Mokesčio statusas'
    penalty_status_display.admin_order_field = 'penalty_status'
    
    def mark_as_completed(self, request, queryset):
        """Masinis veiksmas - pažymėti kaip atlikta (skola išpirkta)"""
        updated = queryset.update(status=Violation.Status.COMPLETED)
        self.message_user(
            request,
            f'Sėkmingai pažymėta {updated} pažeidimų kaip atliktų (skola išpirkta).'
        )
    mark_as_completed.short_description = 'Pažymėti kaip atlikta (skola išpirkta)'
    
    def mark_penalty_as_paid(self, request, queryset):
        """Masinis veiksmas - pažymėti mokestį kaip apmokėtą"""
        updated = queryset.update(penalty_status=Violation.PenaltyStatus.PAID)
        self.message_user(
            request,
            f'Sėkmingai pažymėta {updated} mokesčių kaip apmokėtų.'
        )
    mark_penalty_as_paid.short_description = 'Pažymėti mokestį kaip apmokėtą'
    
    def recalculate_penalties(self, request, queryset):
        """Masinis veiksmas - perskaičiuoti mokesčius"""
        updated = 0
        for violation in queryset:
            violation.recalculate_penalty()
            updated += 1
        self.message_user(
            request,
            f'Sėkmingai perskaičiuota {updated} pažeidimų mokesčiai.'
        )
    recalculate_penalties.short_description = 'Perskaičiuoti mokesčius'
    
    def save_model(self, request, obj, form, change):
        """Išsaugo modelį su created_by lauku"""
        if not change:  # Jei naujas įrašas
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# Admin svetainės konfigūracija
admin.site.site_header = "A-DIENYNAS - Pažeidimų valdymas"
admin.site.site_title = "A-DIENYNAS Admin"
admin.site.index_title = "Pažeidimų valdymo sistema"