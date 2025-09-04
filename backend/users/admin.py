# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.db import models
from .models import User

class RolesFilter(admin.SimpleListFilter):
    """
    Custom filter klasė roles filtravimui - filtruoja vartotojus pagal jų roles
    """
    title = 'Rolės'
    parameter_name = 'roles'
    
    def lookups(self, request, model_admin):
        """
        Grąžina galimus filtravimo variantus
        """
        # CHANGE: Gauname visas unikalias roles iš duomenų bazės
        roles = set()
        for user in User.objects.all():
            if user.roles:
                for role in user.roles:
                    roles.add(role)
        
        # Rūšiuojame roles pagal User.Role.choices tvarką
        role_choices = dict(User.Role.choices)
        sorted_roles = []
        for role_value, role_display in role_choices.items():
            if role_value in roles:
                sorted_roles.append((role_value, role_display))
        
        return sorted_roles
    
    def queryset(self, request, queryset):
        """
        Filtruoja queryset pagal pasirinktą rolę
        """
        if self.value():
            # CHANGE: Naudojame contains filtravimą, kuris veikia su JSONField
            return queryset.filter(roles__contains=[self.value()])
        return queryset

class UserAdminForm(forms.ModelForm):
    """
    Vartotojų admin forma su rolių valdymu
    """
    roles = forms.MultipleChoiceField(
        choices=User.Role.choices,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text='Pasirinkite vartotojo roles'
    )
    
    default_role = forms.ChoiceField(
        choices=[('', 'Automatinis pasirinkimas')] + list(User.Role.choices),
        required=False,
        help_text='Numatytoji rolė prisijungimo metu'
    )
    
    class Meta:
        model = User
        fields = '__all__'
        exclude = ['roles']  # Išimame roles iš Meta, nes naudosime custom field
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            if self.instance.roles:
                self.fields['roles'].initial = self.instance.roles
            if self.instance.default_role:
                self.fields['default_role'].initial = self.instance.default_role
    
    class Media:
        js = ('admin/js/user_admin.js',)
    
    def clean(self):
        """
        Formos validacija - patikrina ar default_role yra tarp pasirinktų rolių
        """
        cleaned_data = super().clean()
        roles = cleaned_data.get('roles', [])
        default_role = cleaned_data.get('default_role')
        
        if default_role and default_role not in roles:
            raise forms.ValidationError({
                'default_role': 'Numatytoji rolė turi būti viena iš pasirinktų rolių.'
            })
        
        return cleaned_data

class UserCreationForm(forms.ModelForm):
    """
    Vartotojų kūrimo forma su rolių valdymu
    """
    password1 = forms.CharField(label='Slaptažodis', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Slaptažodžio patvirtinimas', widget=forms.PasswordInput)
    roles = forms.MultipleChoiceField(
        choices=User.Role.choices,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text='Pasirinkite vartotojo roles'
    )
    
    default_role = forms.ChoiceField(
        choices=[('', 'Automatinis pasirinkimas')] + list(User.Role.choices),
        required=False,
        help_text='Numatytoji rolė prisijungimo metu'
    )
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'roles', 'default_role')
    
    class Media:
        js = ('admin/js/user_admin.js',)
    
    def clean(self):
        """
        Formos validacija - patikrina ar default_role yra tarp pasirinktų rolių
        """
        cleaned_data = super().clean()
        roles = cleaned_data.get('roles', [])
        default_role = cleaned_data.get('default_role')
        
        if default_role and default_role not in roles:
            raise forms.ValidationError({
                'default_role': 'Numatytoji rolė turi būti viena iš pasirinktų rolių.'
            })
        
        return cleaned_data
    
    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Slaptažodžiai nesutampa")
        return password2
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Vartotojų admin konfigūracija - valdo vartotojų administravimą
    """
    model = User
    form = UserAdminForm
    add_form = UserCreationForm
    list_display = ['email', 'first_name', 'last_name', 'get_roles_display', 'is_active', 'date_joined']
    list_filter = ['is_active', 'date_joined', RolesFilter]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Asmeninė informacija', {'fields': ('first_name', 'last_name', 'birth_date', 'phone_number')}),
        ('Rolės ir teisės', {'fields': ('roles', 'default_role', 'contract_number', 'is_active', 'is_staff', 'is_superuser')}),
        ('Svarbūs datos', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'roles', 'default_role', 'password1', 'password2'),
        }),
    )

    def get_roles_display(self, obj):
        """
        Grąžina rolių sąrašą admin sąraše
        """
        return ', '.join([str(obj.get_role_display(role)) for role in obj.roles]) if obj.roles else 'No roles'
    get_roles_display.short_description = 'Rolės'

    def save_model(self, request, obj, form, change):
        """
        Išsaugo modelį su rolių valdymu ir validacijom
        """
        if 'roles' in form.cleaned_data:
            obj.roles = form.cleaned_data['roles']
        if 'default_role' in form.cleaned_data:
            default_role = form.cleaned_data['default_role']
            # Validacija: default_role turi būti viena iš pasirinktų rolių
            if default_role and default_role not in obj.roles:
                obj.default_role = None
            else:
                obj.default_role = default_role if default_role else None
        super().save_model(request, obj, form, change)
