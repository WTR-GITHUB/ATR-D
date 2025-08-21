# backend/plans/serializers.py
import logging
from rest_framework import serializers
from .models import LessonSequence, LessonSequenceItem, IMUPlan
from curriculum.models import Subject, Level

# Get logger for this module
logger = logging.getLogger(__name__)


class LessonSequenceSerializer(serializers.ModelSerializer):
    """
    Pamokų sekos serializeris - valdo sekų duomenų serializavimą
    CHANGE: Pridėtas items laukas su pamokų informacija skaitymo operacijoms
    """
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    items_count = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    
    class Meta:
        model = LessonSequence
        fields = [
            'id', 'name', 'description', 'subject', 'subject_name', 
            'level', 'level_name', 'created_by', 'created_by_name',
            'is_active', 'created_at', 'items_count', 'items'
        ]
        read_only_fields = ['created_at']
    
    def get_items_count(self, obj):
        """Grąžina sekos elementų skaičių"""
        return obj.items.count()
    
    def get_items(self, obj):
        """Grąžina sekos elementus su pamokų informacija"""
        try:
            logger.info(f"Getting items for LessonSequence {obj.id}")
            items = obj.items.all().select_related('lesson__subject')
            logger.info(f"Found {items.count()} items for LessonSequence {obj.id}")
            
            result = []
            
            for item in items:
                logger.debug(f"Processing item {item.id}: lesson={item.lesson}, is_deleted={getattr(item.lesson, 'is_deleted', 'N/A') if item.lesson else 'No lesson'}")
                
                # Patikriname ar pamoka egzistuoja ir nėra ištrinta
                if item.lesson and not item.lesson.is_deleted:
                    result.append({
                        'id': item.id,
                        'lesson': item.lesson.id,
                        'lesson_title': item.lesson.title,
                        'lesson_subject': item.lesson.subject.name,
                        'lesson_topic': item.lesson.topic or '',
                        'position': item.position
                    })
                else:
                    # Jei pamoka ištrinta arba neegzistuoja, grąžiname informaciją apie tai
                    result.append({
                        'id': item.id,
                        'lesson': None,
                        'lesson_title': 'IŠTRINTA PAMOKA',
                        'lesson_subject': 'Nenurodyta',
                        'lesson_topic': 'Pamoka buvo ištrinta',
                        'position': item.position,
                        'is_deleted': True
                    })
            
            logger.info(f"Returning {len(result)} items for LessonSequence {obj.id}")
            return result
        except Exception as e:
            logger.error(f"Error in get_items for LessonSequence {obj.id}: {e}")
            return []


class LessonSequenceCreateSerializer(serializers.ModelSerializer):
    """
    Pamokų sekos kūrimo serializeris - valdo sekų kūrimą su elementais
    CHANGE: Pridėtas lesson ID validavimas - patikrinama ar visi lesson ID's egzistuoja prieš kūrimą/atnaujinimą
    """
    items = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text="Pamokų ID sąrašas sekoje"
    )
    
    class Meta:
        model = LessonSequence
        fields = [
            'name', 'description', 'subject', 'level', 'items'
        ]
        read_only_fields = ['id', 'created_by', 'is_active', 'created_at']
    
    def create(self, validated_data):
        """Sukuria seką su elementais"""
        logger.info("Starting creation of new LessonSequence")
        logger.debug(f"Create data: {validated_data}")
        
        items_data = validated_data.pop('items', [])
        
        # Patikriname ar visi lesson ID's egzistuoja ir nėra ištrinti
        from curriculum.models import Lesson
        if items_data:
            logger.info(f"Validating {len(items_data)} lesson IDs")
            # Filtruojame tik aktyvias (ne ištrintas) pamokas
            existing_lessons = Lesson.objects.filter(
                id__in=items_data, 
                is_deleted=False
            )
            existing_lesson_ids = set(existing_lessons.values_list('id', flat=True))
            provided_lesson_ids = set(items_data)
            
            logger.debug(f"Provided lesson IDs: {provided_lesson_ids}")
            logger.debug(f"Existing active lesson IDs: {existing_lesson_ids}")
            
            if provided_lesson_ids != existing_lesson_ids:
                missing_lessons = provided_lesson_ids - existing_lesson_ids
                # Patikriname ar pamokos ištrintos
                deleted_lessons = Lesson.objects.filter(
                    id__in=missing_lessons, 
                    is_deleted=True
                )
                if deleted_lessons.exists():
                    deleted_ids = [str(lesson.id) for lesson in deleted_lessons]
                    error_msg = f"Pamokos su ID {deleted_ids} yra ištrintos ir negali būti naudojamos"
                    logger.error(error_msg)
                    raise serializers.ValidationError(error_msg)
                else:
                    error_msg = f"Pamokos su ID {list(missing_lessons)} neegzistuoja duomenų bazėje"
                    logger.error(error_msg)
                    raise serializers.ValidationError(error_msg)
        
        # Sukuriame seką
        sequence = LessonSequence.objects.create(**validated_data)
        logger.info(f"Created LessonSequence {sequence.id}")
        
        # Sukuriame sekos elementus
        for index, lesson_id in enumerate(items_data):
            LessonSequenceItem.objects.create(
                sequence=sequence,
                lesson_id=lesson_id,
                position=index + 1
            )
            logger.debug(f"Created LessonSequenceItem {lesson_id} at position {index + 1}")
        
        logger.info(f"Successfully created LessonSequence {sequence.id} with {len(items_data)} items")
        return sequence
    
    def update(self, instance, validated_data):
        """Atnaujina seką su elementais"""
        logger.info(f"Starting update for LessonSequence {instance.id}")
        logger.debug(f"Update data: {validated_data}")
        
        items_data = validated_data.pop('items', None)
        
        # Atnaujiname seką
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        logger.info(f"Updated LessonSequence {instance.id} basic fields")
        
        # Atnaujiname elementus, jei pateikti
        if items_data is not None:
            logger.info(f"Updating items for sequence {instance.id}, items count: {len(items_data)}")
            
            # Patikriname ar visi lesson ID's egzistuoja ir nėra ištrinti
            from curriculum.models import Lesson
            existing_lessons = Lesson.objects.filter(
                id__in=items_data, 
                is_deleted=False
            )
            existing_lesson_ids = set(existing_lessons.values_list('id', flat=True))
            provided_lesson_ids = set(items_data)
            
            logger.debug(f"Provided lesson IDs: {provided_lesson_ids}")
            logger.debug(f"Existing active lesson IDs: {existing_lesson_ids}")
            
            if provided_lesson_ids != existing_lesson_ids:
                missing_lessons = provided_lesson_ids - existing_lesson_ids
                # Patikriname ar pamokos ištrintos
                deleted_lessons = Lesson.objects.filter(
                    id__in=missing_lessons, 
                    is_deleted=True
                )
                if deleted_lessons.exists():
                    deleted_ids = [str(lesson.id) for lesson in deleted_lessons]
                    error_msg = f"Pamokos su ID {deleted_ids} yra ištrintos ir negali būti naudojamos"
                    logger.error(error_msg)
                    raise serializers.ValidationError(error_msg)
                else:
                    error_msg = f"Pamokos su ID {list(missing_lessons)} neegzistuoja duomenų bazėje"
                    logger.error(error_msg)
                    raise serializers.ValidationError(error_msg)
            
            # Ištriname senus elementus
            old_items_count = instance.items.count()
            instance.items.all().delete()
            logger.info(f"Deleted {old_items_count} old items from sequence {instance.id}")
            
            # Sukuriame naujus elementus
            for index, lesson_id in enumerate(items_data):
                LessonSequenceItem.objects.create(
                    sequence=instance,
                    lesson_id=lesson_id,
                    position=index + 1
                )
                logger.debug(f"Created item {index + 1} with lesson_id {lesson_id}")
            
            logger.info(f"Successfully created {len(items_data)} new items for sequence {instance.id}")
        else:
            logger.info(f"No items data provided for sequence {instance.id}")
        
        logger.info(f"Successfully updated LessonSequence {instance.id}")
        return instance


class LessonSequenceItemSerializer(serializers.ModelSerializer):
    """
    Sekos elemento serializeris - valdo elemento duomenų serializavimą
    """
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_subject = serializers.CharField(source='lesson.subject.name', read_only=True)
    
    class Meta:
        model = LessonSequenceItem
        fields = ['lesson', 'lesson_title', 'lesson_subject', 'position']
        read_only_fields = ['id', 'sequence', 'position']


class IMUPlanSerializer(serializers.ModelSerializer):
    """
    Individualaus mokinio ugdymo plano serializeris
    REFAKTORINIMAS: Pašalinti plan_status, started_at, completed_at - perkelta į GlobalSchedule
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    lesson_subject = serializers.CharField(source='lesson.subject.name', read_only=True)
    global_schedule_date = serializers.DateField(source='global_schedule.date', read_only=True)
    global_schedule_time = serializers.TimeField(source='global_schedule.period.starttime', read_only=True)
    global_schedule_classroom = serializers.CharField(source='global_schedule.classroom.name', read_only=True)
    
    # REFAKTORINIMAS: Lankomumo statusas paliekamas IMUPlan
    # CHANGE: Pakeista į SerializerMethodField, kad teisingai apdorotų null reikšmes
    attendance_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = IMUPlan
        fields = [
            'id', 'student', 'student_name',
            'lesson', 'lesson_title', 'lesson_subject',  # CHANGE: Pridėti trūkstami lesson laukai
            'attendance_status', 'attendance_status_display',
            'notes', 'created_at', 'updated_at', 
            'global_schedule_date', 'global_schedule_time', 'global_schedule_classroom'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_attendance_status_display(self, obj):
        """Saugiai grąžina lankomumo statuso display tekstą, apdoroja null reikšmes"""
        if obj.attendance_status:
            return obj.get_attendance_status_display()
        return "Nepažymėta"


class IMUPlanCreateSerializer(serializers.ModelSerializer):
    """
    Individualaus plano kūrimo serializeris
    REFAKTORINIMAS: Pašalinti plan_status, started_at, completed_at - perkelta į GlobalSchedule
    """
    class Meta:
        model = IMUPlan
        fields = [
            'student', 'global_schedule', 'lesson',
            # REFAKTORINIMAS: Lankomumo statusas paliekamas
            'attendance_status', 'notes'
        ]


class IMUPlanBulkCreateSerializer(serializers.Serializer):
    """
    Masinio IMU planų kūrimo serializeris
    REFAKTORINIMAS: Pašalinti plan_status, started_at, completed_at - perkelta į GlobalSchedule
    """
    student_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Mokinių ID sąrašas"
    )
    global_schedule_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Globalaus tvarkaraščio ID sąrašas"
    )
    lesson_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Pamokų ID sąrašas (gali būti trumpesnis nei global_schedule_ids)"
    )
    
    def validate(self, data):
        """Validuoja duomenis"""
        student_ids = data.get('student_ids', [])
        global_schedule_ids = data.get('global_schedule_ids', [])
        lesson_ids = data.get('lesson_ids', [])
        
        if not student_ids:
            raise serializers.ValidationError("Būtina nurodyti bent vieną mokinį")
        
        if not global_schedule_ids:
            raise serializers.ValidationError("Būtina nurodyti bent vieną tvarkaraščio elementą")
        
        if len(lesson_ids) > len(global_schedule_ids):
            raise serializers.ValidationError("Pamokų skaičius negali viršyti tvarkaraščio elementų skaičiaus")
        
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
            raise serializers.ValidationError("Netinkamas datos formatas. Naudokite YYYY-MM-DD")
    
    def validate_end_date(self, value):
        """Validuoja pabaigos datos formatą"""
        from datetime import datetime
        try:
            datetime.strptime(value, '%Y-%m-%d')
            return value
        except ValueError:
            raise serializers.ValidationError("Netinkamas datos formatas. Naudokite YYYY-MM-DD")
    
    def validate(self, data):
        """Validuoja datas"""
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if start_date and end_date:
            from datetime import datetime
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            
            if start > end:
                raise serializers.ValidationError("Pradžios data negali būti vėlesnė už pabaigos datą")
        
        return data
