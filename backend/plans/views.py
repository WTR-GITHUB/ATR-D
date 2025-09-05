# backend/plans/views.py
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from datetime import datetime
import logging

from .models import LessonSequence, LessonSequenceItem, IMUPlan
from .serializers import (
    LessonSequenceSerializer, LessonSequenceCreateSerializer,
    LessonSequenceItemSerializer, IMUPlanSerializer, 
    IMUPlanCreateSerializer, IMUPlanBulkCreateSerializer,
    SubjectSerializer, LevelSerializer, GenerateIMUPlanSerializer
)
from users.models import User
from schedule.models import GlobalSchedule
from curriculum.models import Lesson, Subject, Level


class LessonSequenceViewSet(viewsets.ModelViewSet):
    """
    Pamokų sekos valdymas
    """
    queryset = LessonSequence.objects.select_related('subject', 'level', 'created_by').prefetch_related('items__lesson__subject')
    serializer_class = LessonSequenceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['subject', 'level', 'is_active', 'created_by']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Pasirenka serializerį pagal veiksmą"""
        if self.action in ['create', 'update', 'partial_update']:
            return LessonSequenceCreateSerializer
        return LessonSequenceSerializer
    
    def perform_create(self, serializer):
        """Sukuria seką su dabartiniu vartotoju"""
        serializer.save(created_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Sukuria seką ir grąžina duomenis per skaitymo serializerį"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Grąžiname duomenis per skaitymo serializerį
        instance = serializer.instance
        read_serializer = LessonSequenceSerializer(instance)
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Atnaujina seką ir grąžina duomenis per skaitymo serializerį"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Grąžiname duomenis per skaitymo serializerį
        read_serializer = LessonSequenceSerializer(serializer.instance)
        return Response(read_serializer.data)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Dublikuoja seką su nauju pavadinimu"""
        sequence = self.get_object()
        new_name = f"{sequence.name} (kopija)"
        
        with transaction.atomic():
            new_sequence = LessonSequence.objects.create(
                name=new_name,
                description=sequence.description,
                subject=sequence.subject,
                level=sequence.level,
                created_by=request.user
            )
            
            for item in sequence.items.all():
                LessonSequenceItem.objects.create(
                    sequence=new_sequence,
                    lesson=item.lesson,
                    position=item.position
                )
        
        serializer = self.get_serializer(new_sequence)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def mentor_lessons(self, request):
        """Grąžina prisijungusio mentoriaus pamokas su filtravimo galimybėmis"""
        # Gauti query parametrus
        subject_id = request.query_params.get('subject', None)
        level_id = request.query_params.get('level', None)
        
        # Pradėti nuo mentoriaus pamokų
        mentor_lessons = Lesson.objects.filter(
            mentor=request.user
        ).select_related('subject').prefetch_related('levels')
        
        # Filtruoti pagal dalyką jei nurodyta
        if subject_id:
            try:
                mentor_lessons = mentor_lessons.filter(subject_id=int(subject_id))
            except (ValueError, TypeError):
                pass  # Ignoruoti neteisingus subject_id
        
        # Filtruoti pagal lygį jei nurodyta
        if level_id:
            try:
                mentor_lessons = mentor_lessons.filter(levels__id=int(level_id)).distinct()
            except (ValueError, TypeError):
                pass  # Ignoruoti neteisingus level_id
        
        # Surikiuoti pagal sukūrimo datą
        mentor_lessons = mentor_lessons.order_by('-created_at')
        
        lessons_data = []
        for lesson in mentor_lessons:
            # Gauti visų lygių pavadinimus
            level_names = [level.name for level in lesson.levels.all()]
            levels_text = ', '.join(level_names) if level_names else 'Nenurodyta'
            
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'subject': lesson.subject.name,
                'levels': levels_text,
                'topic': lesson.topic or '',
                'created_at': lesson.created_at
            })
        
        return Response(lessons_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def subjects(self, request):
        """Grąžina visus dalykus"""
        subjects = Subject.objects.all().order_by('name')
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def levels(self, request):
        """Grąžina visus mokymo lygius"""
        levels = Level.objects.all().order_by('name')
        serializer = LevelSerializer(levels, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def all_lessons(self, request):
        """Grąžina visas NE ištrintas pamokas pagal dalyką ir lygį (ne tik mentoriaus pamokas)"""
        # Gauti query parametrus
        subject_id = request.query_params.get('subject', None)
        level_id = request.query_params.get('level', None)
        
        # Pradėti nuo visų NE ištrintų pamokų
        all_lessons = Lesson.objects.filter(is_deleted=False).select_related('subject').prefetch_related('levels')
        
        # Filtruoti pagal dalyką jei nurodyta
        if subject_id:
            try:
                all_lessons = all_lessons.filter(subject_id=int(subject_id))
            except (ValueError, TypeError):
                pass  # Ignoruoti neteisingus subject_id
        
        # Filtruoti pagal lygį jei nurodyta
        if level_id:
            try:
                all_lessons = all_lessons.filter(levels__id=int(level_id)).distinct()
            except (ValueError, TypeError):
                pass  # Ignoruoti neteisingus level_id
        
        # Surikiuoti pagal sukūrimo datą
        all_lessons = all_lessons.order_by('-created_at')
        
        lessons_data = []
        for lesson in all_lessons:
            # Gauti visų lygių pavadinimus
            level_names = [level.name for level in lesson.levels.all()]
            levels_text = ', '.join(level_names) if level_names else 'Nenurodyta'
            
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'subject': lesson.subject.name,
                'levels': levels_text,
                'topic': lesson.topic or '',
                'created_at': lesson.created_at,
                'mentor': lesson.mentor.get_full_name() if lesson.mentor else 'Nenurodyta'
            })
        
        return Response(lessons_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def generate_student_plan_optimized(self, request):
        """
        Optimizuotas IMU plano generavimas vienam studentui
        
        Payload:
        {
            "student_id": 1,
            "subject_id": 2,
            "level_id": 3,
            "lesson_sequence_id": 4,
            "start_date": "2025-01-15",
            "end_date": "2025-02-15"
        }
        
        Response:
        {
            "student_id": 1,
            "student_name": "Jonas Jonaitis",
            "processed": 8,
            "created": 6,
            "updated": 2,
            "skipped": 0,
            "null_lessons": 0,
            "unused_lessons": [],
            "skipped_details": []
        }
        """
        logger = logging.getLogger(__name__)
        
        # 1. VALIDACIJA
        serializer = GenerateIMUPlanSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        logger.info(f"Starting IMU plan generation for student {data['student_id']}")
        
        try:
            # 2. FILTRUOTI GLOBALSCHEDULE
            schedules = self._filter_global_schedules(data, logger)
            if not schedules:
                logger.info(f"No GlobalSchedule found for criteria - returning empty result")
                # Grąžiname sėkmingą atsakymą su tuščiu rezultatu
                student = User.objects.get(id=data['student_id'])
                return Response({
                    'student_id': data['student_id'],
                    'student_name': f"{student.first_name} {student.last_name}".strip() or student.username,
                    'processed': 0,
                    'created': 0,
                    'updated': 0,
                    'skipped': 0,
                    'null_lessons': 0,
                    'unused_lessons': [],
                    'skipped_details': [],
                    'info_message': f'Nerasta tvarkaraščio įrašų laikotarpyje {data["start_date"]} - {data["end_date"]} dalykui ir lygiui'
                }, status=status.HTTP_200_OK)
            
            # 3. GAUTI LESSON SEQUENCE
            sequence = LessonSequence.objects.get(id=data['lesson_sequence_id'])
            lessons = list(sequence.items.order_by('position'))
            
            logger.info(f"Found {len(schedules)} schedules and {len(lessons)} lessons in sequence")
            
            # 4. PROCESAVIMAS STUDENTUI
            result = self._process_single_student_optimized(
                data['student_id'], schedules, lessons, logger
            )
            
            logger.info(f"Generation completed for student {data['student_id']}: {result}")
            return Response(result, status=status.HTTP_200_OK)
            
        except LessonSequence.DoesNotExist:
            logger.error(f"LessonSequence {data['lesson_sequence_id']} not found")
            return Response({
                'error': 'Ugdymo planas nerastas'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return Response({
                'error': f'Nenumatyta klaida: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _filter_global_schedules(self, data, logger):
        """Filtruoja GlobalSchedule pagal kriterijus su logging"""
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        logger.info(f"Filtering criteria: subject={data['subject_id']}, level={data['level_id']}")
        logger.info(f"Date range: {start_date} to {end_date}")
        
        schedules = GlobalSchedule.objects.filter(
            subject_id=data['subject_id'],
            level_id=data['level_id'],
            date__gte=start_date,
            date__lte=end_date
        ).select_related(
            'period', 'subject', 'level', 'classroom', 'user'
        ).order_by('date', 'period__starttime')
        
        # DETALUS LOGGING
        logger.info(f"Found {schedules.count()} matching schedules:")
        for schedule in schedules:
            logger.info(f"  - {schedule.date} {schedule.period} | {schedule.subject.name} | {schedule.classroom.name}")
        
        return list(schedules)
    
    def _process_single_student_optimized(self, student_id, schedules, lessons, logger):
        """Procesavimas vienam studentui su length mismatch handling"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        student = User.objects.get(id=student_id)
        logger.info(f"Processing student: {student.get_full_name() or student.username}")
        
        result = {
            'student_id': student_id,
            'student_name': f"{student.first_name} {student.last_name}".strip() or student.username,
            'processed': 0,
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'null_lessons': 0,
            'unused_lessons': [],
            'skipped_details': []
        }
        
        # BULK PREFETCH existing plans
        existing_plans_dict = {
            plan.global_schedule_id: plan
            for plan in IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__in=schedules
            ).select_related('global_schedule')
        }
        
        logger.info(f"Found {len(existing_plans_dict)} existing IMU plans for student")
        
        # HANDLE LENGTH MISMATCH
        max_assignments = len(schedules)  # Process all schedules
        
        for i, schedule in enumerate(schedules):
            result['processed'] += 1
            
            # Check existing IMUPlan
            existing = existing_plans_dict.get(schedule.id)
            
            # CHANGE: Tikriname GlobalSchedule plan_status vietoj IMUPlan attendance_status
            # Pamoka negali būti perrašyta, jei planas jau vyksta arba baigtas
            if existing and existing.global_schedule.plan_status != 'planned':
                result['skipped'] += 1
                result['skipped_details'].append({
                    'date': schedule.date.strftime('%Y-%m-%d'),
                    'period_info': f"{schedule.period.name or f'{schedule.period.id} pamoka'} ({schedule.period.starttime.strftime('%H:%M')}-{schedule.period.endtime.strftime('%H:%M')})",
                    'subject': schedule.subject.name,
                    'reason': f"Plan status '{existing.global_schedule.get_plan_status_display()}' - cannot overwrite"
                })
                logger.info(f"  SKIPPED: {schedule.date} - plan status {existing.global_schedule.plan_status}")
                continue
            
            # Assign lesson or null
            if i < len(lessons):
                current_lesson = lessons[i].lesson
                logger.info(f"  ASSIGN: {schedule.date} -> lesson {current_lesson.title}")
            else:
                current_lesson = None
                result['null_lessons'] += 1
                logger.info(f"  NULL LESSON: {schedule.date} (no more lessons in sequence)")
            
            # Create/Update IMUPlan
            imu_plan, created = IMUPlan.objects.update_or_create(
                student_id=student_id,
                global_schedule=schedule,
                defaults={
                    'lesson': current_lesson,
                    'attendance_status': None  # CHANGE: Pakeista iš 'present' į None - lankomumo būsena pradžioje tuščia
                }
            )
            
            if created:
                result['created'] += 1
                logger.info(f"  CREATED: IMUPlan for {schedule.date}")
            else:
                result['updated'] += 1
                logger.info(f"  UPDATED: IMUPlan for {schedule.date}")
        
        # Track unused lessons
        if len(lessons) > len(schedules):
            unused_lessons = lessons[len(schedules):]
            result['unused_lessons'] = [
                {
                    'position': lesson.position,
                    'lesson_title': lesson.lesson.title
                }
                for lesson in unused_lessons
            ]
            logger.info(f"UNUSED LESSONS: {len(unused_lessons)} lessons not assigned")
        
        return result


class LessonSequenceItemViewSet(viewsets.ModelViewSet):
    """
    Sekos elementų valdymas
    """
    queryset = LessonSequenceItem.objects.all()
    serializer_class = LessonSequenceItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['sequence', 'lesson']
    ordering = ['sequence', 'position']


class IMUPlanViewSet(viewsets.ModelViewSet):
    """
    Individualių mokinių ugdymo planų valdymas
    REFAKTORINIMAS: Pašalinti plan_status, started_at, completed_at valdymas - perkelta į GlobalSchedule
    """
    queryset = IMUPlan.objects.all()
    serializer_class = IMUPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'attendance_status', 'global_schedule', 'global_schedule__subject', 'global_schedule__level']
    search_fields = ['student__first_name', 'student__last_name', 'lesson__title']
    ordering_fields = ['created_at', 'global_schedule__date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Pasirenka serializerį pagal veiksmą"""
        if self.action == 'create':
            return IMUPlanCreateSerializer
        return IMUPlanSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_create_from_sequence(self, request):
        """
        REFAKTORINIMAS: Masiniškai sukuria IMU planus iš pamokų sekos
        """
        serializer = IMUPlanBulkCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            with transaction.atomic():
                created_plans = []
                warnings = []
                
                for i, student_id in enumerate(data['student_ids']):
                    for j, schedule_id in enumerate(data['global_schedule_ids']):
                        # Priskiriame pamoką, jei yra
                        lesson = None
                        if j < len(data['lesson_ids']):
                            lesson_id = data['lesson_ids'][j]
                            try:
                                lesson = Lesson.objects.get(id=lesson_id)
                            except Lesson.DoesNotExist:
                                warnings.append(f"Pamoka su ID {lesson_id} nerasta")
                                continue
                        
                        # Sukuriame IMU planą
                        plan, created = IMUPlan.objects.get_or_create(
                            student_id=student_id,
                            global_schedule_id=schedule_id,
                            defaults={
                                'lesson': lesson,
                                'attendance_status': None  # CHANGE: Pakeista iš 'present' į None - lankomumo būsena pradžioje tuščia
                            }
                        )
                        
                        if not created and lesson:
                            # Atnaujiname esamą planą
                            plan.lesson = lesson
                            plan.save()
                        
                        created_plans.append({
                            'id': plan.id,
                            'student_id': student_id,
                            'schedule_id': schedule_id,
                            'lesson_id': lesson.id if lesson else None,
                            'created': created
                        })
                
                result = {
                    "message": f"Sėkmingai sukurti {len(created_plans)} planai",
                    "plans": created_plans,
                    "warnings": warnings if warnings else None
                }
                
                return Response(result, status=status.HTTP_201_CREATED)
                
        except LessonSequence.DoesNotExist:
            return Response(
                {"error": "Pamokų seka nerasta"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def attendance_stats(self, request):
        """
        Skaičiuoja mokinio lankomumo statistiką pagal subject (dalyką)
        Išskaičiuoja įrašus su attendance_status = None (neįskaičiuojami)
        """
        student_id = request.query_params.get('student_id')
        subject_id = request.query_params.get('subject_id')
        
        if not student_id or not subject_id:
            return Response(
                {"error": "Reikalingi parametrai: student_id ir subject_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Skaičiuojame visus įrašus mokiniui pagal subject (išskaičiuojame None)
            total_records = IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__subject_id=subject_id
            ).exclude(attendance_status__isnull=True).count()
            
            # Skaičiuojame present įrašus
            present_records = IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__subject_id=subject_id,
                attendance_status='present'
            ).count()
            
            # Skaičiuojame procentą
            percentage = 0
            if total_records > 0:
                percentage = round((present_records / total_records) * 100)
            
            # Skaičiuojame kitus statusus
            absent_records = IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__subject_id=subject_id,
                attendance_status='absent'
            ).count()
            
            left_records = IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__subject_id=subject_id,
                attendance_status='left'
            ).count()
            
            excused_records = IMUPlan.objects.filter(
                student_id=student_id,
                global_schedule__subject_id=subject_id,
                attendance_status='excused'
            ).count()
            
            return Response({
                "student_id": student_id,
                "subject_id": subject_id,
                "total_records": total_records,
                "present_records": present_records,
                "absent_records": absent_records,
                "left_records": left_records,
                "excused_records": excused_records,
                "percentage": percentage,
                "calculated_from": f"{present_records}/{total_records}"
            })
            
        except Exception as e:
            return Response(
                {"error": f"Klaida skaičiuojant statistiką: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def bulk_attendance_stats(self, request):
        """
        Skaičiuoja mokinių lankomumo statistiką pagal subject (dalyką) ir global_schedule (pamoką) viena užklausa
        Išskaičiuoja įrašus su attendance_status = None (neįskaičiuojami)
        """
        subject_id = request.query_params.get('subject_id')
        global_schedule_id = request.query_params.get('global_schedule_id')
        lesson_id = request.query_params.get('lesson_id')
        
        if not subject_id:
            return Response(
                {"error": "Reikalingas parametras: subject_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Filtruoti pagal subject, global_schedule ir lesson (jei pateikti)
            filter_kwargs = {
                'global_schedule__subject_id': subject_id
            }
            
            if global_schedule_id:
                filter_kwargs['global_schedule_id'] = global_schedule_id
                
            if lesson_id:
                filter_kwargs['lesson'] = lesson_id
            
            # Gauti tik tų mokinių IMUPlan įrašus, kurie yra konkrečioje pamokoje
            imu_plans = IMUPlan.objects.filter(
                **filter_kwargs
            ).select_related('student', 'global_schedule__subject')
            
            # Grupuoti pagal student_id
            student_stats = {}
            
            for plan in imu_plans:
                student_id = plan.student_id
                if student_id not in student_stats:
                    student_stats[student_id] = {
                        'student_id': student_id,
                        'student_name': plan.student.first_name + ' ' + plan.student.last_name,
                        'total_records': 0,
                        'present_records': 0,
                        'absent_records': 0,
                        'left_records': 0,
                        'excused_records': 0
                    }
                
                # Skaičiuoti tik įrašus su attendance_status
                if plan.attendance_status:
                    student_stats[student_id]['total_records'] += 1
                    
                    if plan.attendance_status == 'present':
                        student_stats[student_id]['present_records'] += 1
                    elif plan.attendance_status == 'absent':
                        student_stats[student_id]['absent_records'] += 1
                    elif plan.attendance_status == 'left':
                        student_stats[student_id]['left_records'] += 1
                    elif plan.attendance_status == 'excused':
                        student_stats[student_id]['excused_records'] += 1
            
            # Apskaičiuoti procentus
            for student_id in student_stats:
                stats = student_stats[student_id]
                if stats['total_records'] > 0:
                    stats['percentage'] = round((stats['present_records'] / stats['total_records']) * 100)
                else:
                    stats['percentage'] = 0
                stats['calculated_from'] = f"{stats['present_records']}/{stats['total_records']}"
            
            return Response({
                "subject_id": subject_id,
                "global_schedule_id": global_schedule_id,
                "lesson_id": lesson_id,
                "students_count": len(student_stats),
                "students": list(student_stats.values())
            })
            
        except Exception as e:
            return Response(
                {"error": f"Klaida skaičiuojant bulk statistiką: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def bulk_attendance_stats(self, request):
        """
        Skaičiuoja visų mokinių lankomumo statistiką pagal subject (dalyką) viena užklausa
        Optimizuota, kad išvengti per daug API užklausų
        """
        subject_id = request.query_params.get('subject_id')
        
        if not subject_id:
            return Response(
                {"error": "Reikalingas parametras: subject_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Gauname visus IMUPlan įrašus šiam subject su student informacija
            imu_plans = IMUPlan.objects.filter(
                global_schedule__subject_id=subject_id
            ).select_related('student', 'global_schedule__subject')
            
            # Grupuojame pagal student_id
            student_stats = {}
            
            for plan in imu_plans:
                student_id = plan.student_id
                
                if student_id not in student_stats:
                    student_stats[student_id] = {
                        'student_id': student_id,
                        'student_name': f"{plan.student.first_name} {plan.student.last_name}",
                        'total_records': 0,
                        'present_records': 0,
                        'absent_records': 0,
                        'left_records': 0,
                        'excused_records': 0
                    }
                
                # Skaičiuojame tik įrašus su attendance_status
                if plan.attendance_status is not None:
                    student_stats[student_id]['total_records'] += 1
                    
                    if plan.attendance_status == 'present':
                        student_stats[student_id]['present_records'] += 1
                    elif plan.attendance_status == 'absent':
                        student_stats[student_id]['absent_records'] += 1
                    elif plan.attendance_status == 'left':
                        student_stats[student_id]['left_records'] += 1
                    elif plan.attendance_status == 'excused':
                        student_stats[student_id]['excused_records'] += 1
            
            # Skaičiuojame procentus
            for stats in student_stats.values():
                if stats['total_records'] > 0:
                    stats['percentage'] = round((stats['present_records'] / stats['total_records']) * 100)
                    stats['calculated_from'] = f"{stats['present_records']}/{stats['total_records']}"
                else:
                    stats['percentage'] = 0
                    stats['calculated_from'] = "0/0"
            
            return Response({
                "subject_id": subject_id,
                "student_stats": list(student_stats.values())
            })
            
        except Exception as e:
            return Response(
                {"error": f"Klaida skaičiuojant bulk statistiką: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def update_attendance(self, request, pk=None):
        """
        REFAKTORINIMAS: Atnaujina tik lankomumo statusą
        Leidžia nustatyti null reikšmę lankomumo būsenos išvalymui
        """
        plan = self.get_object()
        new_status = request.data.get('attendance_status')
        
        # Leidžiama null reikšmė lankomumo būsenos išvalymui
        if new_status is not None and new_status not in dict(IMUPlan.ATTENDANCE_CHOICES):
            return Response(
                {"error": "Netinkamas lankomumo statusas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plan.attendance_status = new_status
        plan.save()
        
        return Response({
            "message": "Lankomumo statusas sėkmingai atnaujintas",
            "attendance_status": plan.attendance_status,
            "attendance_status_display": plan.get_attendance_status_display() if plan.attendance_status else "Nepažymėta"
        })
    
    @action(detail=False, methods=['get'])
    def student_schedule(self, request):
        """
        Grąžina studento tvarkaraštį pagal studento ID ir datą/savaitę
        CHANGE: Sukurtas naujas endpoint studento tvarkaraščio duomenims gauti
        """
        from datetime import datetime, timedelta
        
        student_id = request.query_params.get('student_id')
        date = request.query_params.get('date')  # YYYY-MM-DD formatas
        week_start = request.query_params.get('week_start')  # YYYY-MM-DD formatas (pirmadienio data)
        
        if not student_id:
            return Response(
                {"error": "Būtina nurodyti student_id parametrą"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Patikriname ar studentas egzistuoja
            student = User.objects.get(id=student_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Studentas nerastas"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Nustatome filtravimo datą
        if date:
            try:
                target_date = datetime.strptime(date, '%Y-%m-%d').date()
                # Filtruojame pagal konkrečią datą
                queryset = IMUPlan.objects.filter(
                    student_id=student_id,
                    global_schedule__date=target_date
                )
            except ValueError:
                return Response(
                    {"error": "Netinkamas datos formatas. Naudokite YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif week_start:
            try:
                start_date = datetime.strptime(week_start, '%Y-%m-%d').date()
                end_date = start_date + timedelta(days=6)  # Savaitė = 7 dienos
                # Filtruojame pagal savaitę
                queryset = IMUPlan.objects.filter(
                    student_id=student_id,
                    global_schedule__date__range=[start_date, end_date]
                )
            except ValueError:
                return Response(
                    {"error": "Netinkamas savaitės datos formatas. Naudokite YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {"error": "Būtina nurodyti date arba week_start parametrą"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Optimizuojame užklausą su select_related
        queryset = queryset.select_related(
            'global_schedule__subject',
            'global_schedule__level', 
            'global_schedule__classroom',
            'global_schedule__period',
            'lesson__subject'
        ).order_by('global_schedule__date', 'global_schedule__period__starttime')
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            "student_id": student_id,
            "student_name": f"{student.first_name} {student.last_name}".strip() or student.username,
            "filter_type": "date" if date else "week",
            "filter_value": date or week_start,
            "count": queryset.count(),
            "results": serializer.data
        })