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
