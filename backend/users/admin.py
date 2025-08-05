from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from .models import User

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
    
    class Meta:
        model = User
        fields = '__all__'
        exclude = ['roles']  # Išimame roles iš Meta, nes naudosime custom field
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk and self.instance.roles:
            self.fields['roles'].initial = self.instance.roles

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
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'roles')
    
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
    list_filter = ['is_active', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Asmeninė informacija', {'fields': ('first_name', 'last_name', 'birth_date', 'phone_number')}),
        ('Rolės ir teisės', {'fields': ('roles', 'contract_number', 'is_active', 'is_staff', 'is_superuser')}),
        ('Svarbūs datos', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'roles', 'password1', 'password2'),
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
        Išsaugo modelį su rolių valdymu
        """
        if 'roles' in form.cleaned_data:
            obj.roles = form.cleaned_data['roles']
        super().save_model(request, obj, form, change)
