# backend/plans/serializers.py
from rest_framework import serializers
from .models import LessonSequence, LessonSequenceItem, IMUPlan
from curriculum.models import Subject, Level


class LessonSequenceItemSerializer(serializers.ModelSerializer):
    """
    Sekos elemento serializeris skaitymui
    """
    lesson = serializers.IntegerField(source='lesson.id', read_only=True)  # Grąžiname tik lesson ID
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_subject = serializers.CharField(source='lesson.subject.name', read_only=True)
    lesson_topic = serializers.CharField(source='lesson.topic', read_only=True)
    
    class Meta:
        model = LessonSequenceItem
        fields = ['id', 'lesson', 'lesson_title', 'lesson_subject', 'lesson_topic', 'position']


class LessonSequenceItemCreateSerializer(serializers.ModelSerializer):
    """
    Sekos elemento serializeris kūrimui ir atnaujinimui
    """
    lesson = serializers.IntegerField()  # Aiškiai nurodome, kad lesson turi būti skaičius
    
    class Meta:
        model = LessonSequenceItem
        fields = ['lesson', 'position']


class LessonSequenceSerializer(serializers.ModelSerializer):
    """
    Pamokų sekos serializeris
    """
    items = LessonSequenceItemSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonSequence
        fields = [
            'id', 'name', 'description', 'subject', 'subject_name', 
            'level', 'level_name', 'created_by', 'created_by_name',
            'is_active', 'created_at', 'items', 'items_count'
        ]
        read_only_fields = ['created_at']
    
    def get_items_count(self, obj):
        """Rodo sekos elementų skaičių"""
        return obj.items.count()


class LessonSequenceCreateSerializer(serializers.ModelSerializer):
    """
    Pamokų sekos kūrimo serializeris
    """
    items = LessonSequenceItemCreateSerializer(many=True)
    
    class Meta:
        model = LessonSequence
        fields = [
            'id', 'name', 'description', 'subject', 'level', 
            'created_by', 'is_active', 'items'
        ]
    
    def create(self, validated_data):
        """Sukuria seką su elementais"""
        items_data = validated_data.pop('items', [])
        sequence = LessonSequence.objects.create(**validated_data)
        
        for item_data in items_data:
            LessonSequenceItem.objects.create(
                sequence=sequence,
                lesson_id=item_data['lesson'],  # Naudojame lesson_id vietoj lesson
                position=item_data['position']
            )
        
        return sequence
    
    def update(self, instance, validated_data):
        """Atnaujina seką su elementais"""
        items_data = validated_data.pop('items', [])
        
        # Atnaujina pagrindinius laukus
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Ištrina senus elementus ir sukuria naujus
        instance.items.all().delete()
        
        # Sukuria naujus elementus su teisingomis pozicijomis
        for index, item_data in enumerate(items_data):
            print(f"Creating item: lesson={item_data['lesson']}, type={type(item_data['lesson'])}")  # Debug
            LessonSequenceItem.objects.create(
                sequence=instance,
                lesson_id=item_data['lesson'],
                position=index + 1
            )
        
        return instance


class IMUPlanSerializer(serializers.ModelSerializer):
    """
    Individualaus mokinio ugdymo plano serializeris
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_subject = serializers.CharField(source='lesson.subject.name', read_only=True)
    global_schedule_date = serializers.DateField(source='global_schedule.date', read_only=True)
    global_schedule_time = serializers.TimeField(source='global_schedule.period.starttime', read_only=True)
    global_schedule_classroom = serializers.CharField(source='global_schedule.classroom.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = IMUPlan
        fields = [
            'id', 'student', 'student_name', 'global_schedule', 'lesson', 'lesson_title',
            'lesson_subject', 'status', 'status_display', 'started_at', 'completed_at',
            'notes', 'created_at', 'updated_at', 'global_schedule_date', 
            'global_schedule_time', 'global_schedule_classroom'
        ]
        read_only_fields = ['created_at', 'updated_at']


class IMUPlanCreateSerializer(serializers.ModelSerializer):
    """
    Individualaus plano kūrimo serializeris
    """
    class Meta:
        model = IMUPlan
        fields = [
            'id', 'student', 'global_schedule', 'lesson', 'status', 
            'notes', 'started_at', 'completed_at'
        ]


class IMUPlanBulkCreateSerializer(serializers.Serializer):
    """
    Masinio individualaus plano kūrimo serializeris
    """
    students = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Mokinių ID sąrašas"
    )
    sequence_id = serializers.IntegerField(
        help_text="Pamokų sekos ID"
    )
    start_date = serializers.DateField(
        help_text="Pradžios data (YYYY-MM-DD)"
    )
    end_date = serializers.DateField(
        help_text="Pabaigos data (YYYY-MM-DD)"
    )
    
    def validate(self, data):
        """Validuoja duomenis"""
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError("Pradžios data turi būti ankstesnė už pabaigos datą")
        return data


class SubjectSerializer(serializers.ModelSerializer):
    """
    Dalykų serializeris
    """
    class Meta:
        model = Subject
        fields = ['id', 'name', 'description']


class LevelSerializer(serializers.ModelSerializer):
    """
    Mokymo lygių serializeris
    """
    class Meta:
        model = Level
        fields = ['id', 'name', 'description']


class GenerateIMUPlanSerializer(serializers.Serializer):
    """
    Per-student IMU plano generavimo serializeris
    Naudojamas generate_student_plan_optimized endpoint'e
    """
    student_id = serializers.IntegerField(
        help_text="Mokinio ID"
    )
    subject_id = serializers.IntegerField(
        help_text="Dalyko ID"
    )
    level_id = serializers.IntegerField(
        help_text="Lygio ID"
    )
    lesson_sequence_id = serializers.IntegerField(
        help_text="Pamokų sekos ID"
    )
    start_date = serializers.CharField(
        max_length=10,
        help_text="Pradžios data formato YYYY-MM-DD"
    )
    end_date = serializers.CharField(
        max_length=10,
        help_text="Pabaigos data formato YYYY-MM-DD"
    )
    
    def validate_start_date(self, value):
        """Validuoja pradžios datos formatą"""
        from datetime import datetime
        try:
            datetime.strptime(value, '%Y-%m-%d')
            return value
        except ValueError:
            raise serializers.ValidationError("Neteisingas datos formatas. Naudokite YYYY-MM-DD")
    
    def validate_end_date(self, value):
        """Validuoja pabaigos datos formatą"""
        from datetime import datetime
        try:
            datetime.strptime(value, '%Y-%m-%d')
            return value
        except ValueError:
            raise serializers.ValidationError("Neteisingas datos formatas. Naudokite YYYY-MM-DD")
    
    def validate(self, data):
        """Cross-field validacija"""
        from datetime import datetime
        
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if start_date >= end_date:
            raise serializers.ValidationError({
                'end_date': "Pabaigos data turi būti vėlesnė už pradžios datą"
            })
        
        # Tikrinti ar student_id egzistuoja ir yra studentas
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            student = User.objects.get(id=data['student_id'])
            if not student.has_role('student'):
                raise serializers.ValidationError({
                    'student_id': "Nurodytas vartotojas nėra studentas"
                })
        except User.DoesNotExist:
            raise serializers.ValidationError({
                'student_id': "Studentas su šiuo ID neegzistuoja"
            })
        
        # Tikrinti ar lesson_sequence_id egzistuoja
        try:
            LessonSequence.objects.get(id=data['lesson_sequence_id'])
        except LessonSequence.DoesNotExist:
            raise serializers.ValidationError({
                'lesson_sequence_id': "Ugdymo planas su šiuo ID neegzistuoja"
            })
        
        return data
