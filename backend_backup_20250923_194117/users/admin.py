# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm
from django import forms
from django.db import models
from django.utils.html import format_html, escape
from django.utils.translation import gettext_lazy as _
from django.http import Http404, HttpResponseRedirect
from django.urls import reverse
from django.contrib import messages
from django.core.exceptions import PermissionDenied
from django.template.response import TemplateResponse
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

class CustomAdminPasswordChangeForm(AdminPasswordChangeForm):
    """
    Custom slaptažodžio keitimo forma admin panelėje
    CHANGE: Pridėta custom forma slaptažodžio keitimui su lietuviškomis etiketėmis
    """
    def __init__(self, user, *args, **kwargs):
        super().__init__(user, *args, **kwargs)
        # Lietuviškos etiketės
        self.fields['password1'].label = 'Naujas slaptažodis'
        self.fields['password2'].label = 'Patvirtinkite slaptažodį'
        self.fields['password1'].help_text = 'Įveskite naują slaptažodį (minimum 8 simbolių)'
        self.fields['password2'].help_text = 'Pakartokite naują slaptažodį patvirtinimui'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Vartotojų admin konfigūracija - valdo vartotojų administravimą
    CHANGE: Pridėta slaptažodžio keitimo funkcionalumas administratoriams
    """
    model = User
    form = UserAdminForm
    add_form = UserCreationForm
    change_password_form = CustomAdminPasswordChangeForm
    list_display = ['email', 'first_name', 'last_name', 'get_roles_display', 'is_active', 'date_joined']
    list_filter = ['is_active', 'date_joined', RolesFilter]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'get_change_password_link')}),
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
    
    # CHANGE: Pridėta slaptažodžio keitimo funkcionalumas
    readonly_fields = ('last_login', 'date_joined', 'get_change_password_link')

    def get_roles_display(self, obj):
        """
        Grąžina rolių sąrašą admin sąraše
        """
        return ', '.join([str(obj.get_role_display(role)) for role in obj.roles]) if obj.roles else 'No roles'
    get_roles_display.short_description = 'Rolės'
    
    def get_change_password_link(self, obj):
        """
        Grąžina slaptažodžio keitimo nuorodą
        CHANGE: Pridėta slaptažodžio keitimo nuoroda admin sąsajoje
        """
        if obj.pk:
            url = reverse('admin:auth_user_password_change', args=[obj.pk])
            return format_html('<a href="{}" class="button">Keisti slaptažodį</a>', url)
        return '-'
    get_change_password_link.short_description = 'Slaptažodis'
    get_change_password_link.allow_tags = True

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
    
    def get_urls(self):
        """
        Prideda slaptažodžio keitimo URL
        CHANGE: Pridėta slaptažodžio keitimo URL konfigūracija
        """
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<id>/password/',
                self.admin_site.admin_view(self.user_change_password),
                name='auth_user_password_change',
            ),
        ]
        return custom_urls + urls
    
    def user_change_password(self, request, id, form_url=''):
        """
        Slaptažodžio keitimo view
        CHANGE: Pridėta slaptažodžio keitimo funkcionalumas administratoriams
        """
        if not self.has_change_permission(request):
            raise PermissionDenied
        user = self.get_object(request, id)
        if user is None:
            raise Http404(_('User with ID "%(id)s" doesn\'t exist.') % {'id': id})
        
        if request.method == 'POST':
            form = self.change_password_form(user, request.POST)
            if form.is_valid():
                form.save()
                change_message = self.construct_change_message(request, form, None)
                self.log_change(request, user, change_message)
                msg = _('Password changed successfully.')
                messages.success(request, msg)
                return HttpResponseRedirect(
                    reverse(
                        '%s:%s_%s_change' % (
                            self.admin_site.name,
                            user._meta.app_label,
                            user._meta.model_name,
                        ),
                        args=(user.pk,),
                    )
                )
        else:
            form = self.change_password_form(user)
        
        fieldsets = [(None, {'fields': list(form.base_fields)})]
        adminForm = admin.helpers.AdminForm(form, fieldsets, {})
        
        context = {
            'title': _('Change password: %s') % escape(user.get_username()),
            'adminForm': adminForm,
            'form_url': form_url,
            'form': form,
            'is_popup': (request.GET.get('_popup') == '1'),
            'is_popup_var': '_popup',
            'add': True,
            'change': False,
            'has_delete_permission': False,
            'has_change_permission': True,
            'has_absolute_url': False,
            'opts': self.model._meta,
            'original': user,
            'save_as': False,
            'has_add_permission': False,
            'has_view_permission': True,
            'has_editable_inline_admin_formsets': False,
        }
        
        return TemplateResponse(
            request,
            self.change_user_password_template,
            context,
        )
    
    change_user_password_template = 'admin/auth/user/change_password.html'
