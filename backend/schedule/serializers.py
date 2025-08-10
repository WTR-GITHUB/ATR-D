from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Period, Classroom, GlobalSchedule
from curriculum.models import Subject, Level, Lesson


class PeriodSerializer(serializers.ModelSerializer):
    """
    Periodų serializeris - valdo pamokų periodų duomenų serializavimą
    """
    starttime = serializers.SerializerMethodField()
    endtime = serializers.SerializerMethodField()
    
    class Meta:
        model = Period
        fields = '__all__'
    
    def get_starttime(self, obj):
        """Grąžina pradžios laiką hh:mm formatu"""
        if obj.starttime:
            return obj.starttime.strftime('%H:%M')
        return None
    
    def get_endtime(self, obj):
        """Grąžina pabaigos laiką hh:mm formatu"""
        if obj.endtime:
            return obj.endtime.strftime('%H:%M')
        return None


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
    # Pilni objektai su visais laukais
    period = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    subject = serializers.SerializerMethodField()
    classroom = serializers.SerializerMethodField()
    # lesson laukas pašalintas
    
    # Papildomi laukai
    period_name = serializers.CharField(source='period.__str__', read_only=True)
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    # lesson_title laukas pašalintas
    mentor_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = GlobalSchedule
        fields = [
            'id', 'date', 'weekday', 'period', 'classroom', 'subject', 'level', 'user',
            'period_name', 'classroom_name', 'subject_name', 'level_name', 'mentor_name'
        ]
        read_only_fields = ['weekday']  # Savaitės diena nustatoma automatiškai
        # lesson laukas pašalintas
    
    def get_period(self, obj):
        """Grąžina pilną periodo objektą"""
        if obj.period:
            return {
                'id': obj.period.id,
                'name': obj.period.name,
                'starttime': obj.period.starttime.strftime('%H:%M'),
                'endtime': obj.period.endtime.strftime('%H:%M') if obj.period.endtime else None
            }
        return None
    
    def get_level(self, obj):
        """Grąžina pilną lygio objektą"""
        if obj.level:
            return {
                'id': obj.level.id,
                'name': obj.level.name,
                'description': obj.level.description
            }
        return None
    
    def get_user(self, obj):
        """Grąžina pilną vartotojo objektą"""
        if obj.user:
            return {
                'id': obj.user.id,
                'email': obj.user.email,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'full_name': obj.user.get_full_name()
            }
        return None
    
    def get_subject(self, obj):
        """Grąžina pilną dalyko objektą"""
        if obj.subject:
            return {
                'id': obj.subject.id,
                'name': obj.subject.name,
                'description': obj.subject.description
            }
        return None
    
    def get_classroom(self, obj):
        """Grąžina pilną klasės objektą"""
        if obj.classroom:
            return {
                'id': obj.classroom.id,
                'name': obj.classroom.name,
                'description': obj.classroom.description
            }
        return None
    
    # get_lesson metodas pašalintas
    
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