from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Period, Classroom, GlobalSchedule


class PeriodSerializer(serializers.ModelSerializer):
    """
    Periodų serializeris - valdo pamokų periodų duomenų serializavimą
    """
    class Meta:
        model = Period
        fields = '__all__'


class ClassroomSerializer(serializers.ModelSerializer):
    """
    Klasės serializeris - valdo klasės duomenų serializavimą
    """
    class Meta:
        model = Classroom
        fields = '__all__'


class GlobalScheduleSerializer(serializers.ModelSerializer):
    """
    Globalaus tvarkaraščio serializeris - valdo tvarkaraščio duomenų serializavimą
    """
    period_name = serializers.CharField(source='period.__str__', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    mentor_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    # Mentorius turi būti tik mentoriai
    user = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.filter(roles__contains=['mentor']),
        required=True,
        help_text='Pamokos vedėjas (tik mentoriai)'
    )
    
    class Meta:
        model = GlobalSchedule
        fields = [
            'id', 'date', 'weekday', 'period', 'classroom', 'subject', 'level', 'lesson', 'user',
            'period_name', 'classroom_name', 'subject_name', 'level_name', 'lesson_title', 'mentor_name'
        ]
        read_only_fields = ['weekday']  # Savaitės diena nustatoma automatiškai
    
    def validate(self, data):
        """
        Validacija - tikriname, ar klasė nėra užimta šiuo laiku
        """
        date = data.get('date')
        period = data.get('period')
        classroom = data.get('classroom')
        instance = self.instance
        
        if date and period and classroom:
            # Tikriname konfliktus
            conflicting_schedules = GlobalSchedule.objects.filter(
                date=date,
                period=period,
                classroom=classroom
            )
            
            if instance:
                conflicting_schedules = conflicting_schedules.exclude(pk=instance.pk)
            
            if conflicting_schedules.exists():
                raise serializers.ValidationError(
                    'Klasė jau užimta šiuo laiku. Pasirinkite kitą klasę arba laiką.'
                )
        
        return data
    
    def create(self, validated_data):
        """
        Sukuria tvarkaraščio įrašą
        """
        return GlobalSchedule.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        """
        Atnaujina tvarkaraščio įrašą
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance 