# backend/violation/serializers.py

# Violation management serializers for A-DIENYNAS system
# Defines serializers for violation categories, types, ranges, and violations with penalty logic
# CHANGE: Created comprehensive serializers for violation system with penalty calculation and role-based access

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ViolationCategory, ViolationType, ViolationRange, Violation

User = get_user_model()


class ViolationCategorySerializer(serializers.ModelSerializer):
    """
    Pažeidimų kategorijų serializeris
    """
    color_type_display = serializers.CharField(source='get_color_type_display', read_only=True)
    
    class Meta:
        model = ViolationCategory
        fields = [
            'id', 'name', 'description', 'color_type', 'color_type_display', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ViolationTypeSerializer(serializers.ModelSerializer):
    """
    Pažeidimų tipų serializeris
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color_type = serializers.CharField(source='category.color_type', read_only=True)
    
    class Meta:
        model = ViolationType
        fields = [
            'id', 'name', 'category', 'category_name', 'category_color_type',
            'default_amount', 'description', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ViolationRangeSerializer(serializers.ModelSerializer):
    """
    Pažeidimų rėžių serializeris mokesčių skaičiavimui
    """
    range_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ViolationRange
        fields = [
            'id', 'name', 'min_violations', 'max_violations', 'penalty_amount',
            'range_display', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_range_display(self, obj):
        """Grąžina rėžio aprašymą"""
        if obj.max_violations:
            return f"{obj.min_violations}-{obj.max_violations} pažeidimai = {obj.penalty_amount}€"
        else:
            return f"{obj.min_violations}+ pažeidimai = {obj.penalty_amount}€"
    
    def validate(self, data):
        """Validuoja rėžio duomenis"""
        min_violations = data.get('min_violations')
        max_violations = data.get('max_violations')
        
        if max_violations and max_violations < min_violations:
            raise serializers.ValidationError(
                "Maksimalus pažeidimų skaičius negali būti mažesnis už minimalų."
            )
        
        return data


class ViolationSerializer(serializers.ModelSerializer):
    """
    Pagrindinis pažeidimo/skolos serializeris
    """
    # Read-only laukai su papildoma informacija
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    penalty_status_display = serializers.CharField(source='get_penalty_status_display', read_only=True)
    
    # Papildomi laukai
    is_fully_paid = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Violation
        fields = [
            # Pagrindinė informacija
            'id', 'student', 'student_name', 'student_email', 'category', 'violation_type',
            'description', 'amount', 'currency',
            
            # Statusai
            'status', 'status_display', 'penalty_status', 'penalty_status_display',
            
            # Datos
            'created_at', 'task_completed_at', 'penalty_paid_at', 'updated_at',
            
            # Mokesčio informacija
            'violation_count', 'penalty_amount',
            
            # Papildoma informacija
            'created_by', 'created_by_name', 'notes',
            
            # Skaičiuojami laukai
            'is_fully_paid', 'is_overdue'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'violation_count', 'penalty_amount',
            'task_completed_at', 'penalty_paid_at', 'is_fully_paid', 'is_overdue'
        ]
    
    def validate_amount(self, value):
        """Validuoja sumą"""
        if value < 0:
            raise serializers.ValidationError("Suma negali būti neigiama.")
        return value
    
    def validate_student(self, value):
        """Validuoja ar mokinys turi STUDENT rolę"""
        if not value.roles or 'STUDENT' not in value.roles:
            raise serializers.ValidationError("Pasirinktas vartotojas nėra mokinys.")
        return value
    
    def create(self, validated_data):
        """Sukuria naują pažeidimą su automatiniais skaičiavimais"""
        # Nustato created_by jei nenurodyta
        if 'created_by' not in validated_data:
            validated_data['created_by'] = self.context['request'].user
        
        return super().create(validated_data)


class ViolationCreateSerializer(serializers.ModelSerializer):
    """
    Specializuotas serializeris pažeidimų kūrimui
    """
    class Meta:
        model = Violation
        fields = [
            'student', 'category', 'violation_type', 'description', 
            'amount', 'currency', 'notes'
        ]
    
    def validate_amount(self, value):
        """Validuoja sumą"""
        if value < 0:
            raise serializers.ValidationError("Suma negali būti neigiama.")
        return value
    
    def validate_student(self, value):
        """Validuoja ar mokinys turi STUDENT rolę"""
        if not value.roles or 'STUDENT' not in value.roles:
            raise serializers.ValidationError("Pasirinktas vartotojas nėra mokinys.")
        return value
    
    def create(self, validated_data):
        """Sukuria naują pažeidimą su automatiniais skaičiavimais"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ViolationUpdateSerializer(serializers.ModelSerializer):
    """
    Specializuotas serializeris pažeidimų atnaujinimui
    """
    class Meta:
        model = Violation
        fields = [
            'category', 'violation_type', 'description', 'amount', 
            'currency', 'status', 'penalty_status', 'notes'
        ]
    
    def validate_amount(self, value):
        """Validuoja sumą"""
        if value < 0:
            raise serializers.ValidationError("Suma negali būti neigiama.")
        return value


class ViolationBulkActionSerializer(serializers.Serializer):
    """
    Serializeris masiniams veiksmams su pažeidimais
    """
    ACTION_CHOICES = [
        ('mark_completed', 'Pažymėti kaip atlikta (skola išpirkta)'),
        ('mark_penalty_paid', 'Pažymėti mokestį kaip apmokėtą'),
        ('recalculate_penalties', 'Perskaičiuoti mokesčius'),
        ('delete', 'Ištrinti pažeidimus'),
    ]
    
    action = serializers.ChoiceField(choices=ACTION_CHOICES)
    violation_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text="Pažeidimų ID sąrašas"
    )
    
    def validate_violation_ids(self, value):
        """Validuoja ar visi ID egzistuoja"""
        existing_ids = set(Violation.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = set(value) - existing_ids
        
        if invalid_ids:
            raise serializers.ValidationError(
                f"Šie pažeidimų ID neegzistuoja: {list(invalid_ids)}"
            )
        
        return value


class ViolationStatsSerializer(serializers.Serializer):
    """
    Serializeris pažeidimų statistikai
    """
    total_violations = serializers.IntegerField()
    completed_violations = serializers.IntegerField()
    pending_violations = serializers.IntegerField()
    total_penalty_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    paid_penalty_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    unpaid_penalty_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    completion_rate = serializers.FloatField()
    penalty_payment_rate = serializers.FloatField()
    
    # Kategorijų statistika
    category_stats = serializers.DictField()
    
    # Mėnesio statistika
    monthly_stats = serializers.DictField()


class ViolationCategoryStatsSerializer(serializers.Serializer):
    """
    Serializeris kategorijų statistikai
    """
    category_name = serializers.CharField()
    color_type = serializers.CharField()
    total_count = serializers.IntegerField()
    completed_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    penalty_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
