from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import LessonSequence, LessonSequenceItem, IMUPlan
from .serializers import (
    LessonSequenceSerializer, LessonSequenceCreateSerializer,
    LessonSequenceItemSerializer, IMUPlanSerializer, 
    IMUPlanCreateSerializer, IMUPlanBulkCreateSerializer,
    SubjectSerializer, LevelSerializer
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
        """Grąžina prisijungusio mentoriaus pamokas"""
        mentor_lessons = Lesson.objects.filter(
            mentor=request.user
        ).select_related('subject').order_by('-created_at')
        
        lessons_data = []
        for lesson in mentor_lessons:
            lessons_data.append({
                'id': lesson.id,
                'title': lesson.title,
                'subject': lesson.subject.name,
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
    """
    queryset = IMUPlan.objects.all()
    serializer_class = IMUPlanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['student', 'status', 'global_schedule__subject', 'global_schedule__level']
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
        Masiniu būdu sukuria individualius planus iš sekos
        """
        serializer = IMUPlanBulkCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        students = data['students']
        sequence_id = data['sequence_id']
        start_date = data['start_date']
        end_date = data['end_date']
        
        try:
            sequence = get_object_or_404(LessonSequence, id=sequence_id)
            
            # Gauna GlobalSchedule įrašus pagal datą
            global_schedules = GlobalSchedule.objects.filter(
                date__range=[start_date, end_date],
                subject=sequence.subject,
                level=sequence.level
            ).order_by('date', 'period__starttime')
            
            if not global_schedules.exists():
                return Response(
                    {"error": "Nerasta veiklų nurodytame laikotarpyje"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Patikrina, ar yra pakankamai veiklų
            sequence_items = sequence.items.all().order_by('position')
            if len(global_schedules) < len(sequence_items):
                return Response(
                    {"error": f"Trūksta veiklų. Seka turi {len(sequence_items)} elementų, o veiklų yra {len(global_schedules)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            created_plans = []
            warnings = []
            
            with transaction.atomic():
                for student_id in students:
                    try:
                        student = get_object_or_404(User, id=student_id)
                        
                        # Patikrina, ar mokinys turi atitinkamą lygį
                        if not student.has_role('student'):
                            warnings.append(f"Vartotojas {student.get_full_name()} nėra mokinys")
                            continue
                        
                        # Sukuria planus kiekvienam mokiniui
                        for i, (schedule, item) in enumerate(zip(global_schedules, sequence_items)):
                            # Patikrina, ar planas jau egzistuoja
                            existing_plan = IMUPlan.objects.filter(
                                student=student,
                                global_schedule=schedule
                            ).first()
                            
                            if existing_plan:
                                # Jei planas jau egzistuoja, tikrina ar galima keisti
                                if existing_plan.status in ['completed', 'missed', 'cancelled']:
                                    warnings.append(
                                        f"Mokinys {student.get_full_name()} jau turi {existing_plan.get_status_display()} "
                                        f"pamoką {schedule.date} {schedule.period.starttime}"
                                    )
                                    continue
                                else:
                                    # Atnaujina esamą planą
                                    existing_plan.lesson = item.lesson
                                    existing_plan.save()
                                    created_plans.append(existing_plan)
                            else:
                                # Sukuria naują planą
                                plan = IMUPlan.objects.create(
                                    student=student,
                                    global_schedule=schedule,
                                    lesson=item.lesson,
                                    status='planned'
                                )
                                created_plans.append(plan)
                    
                    except User.DoesNotExist:
                        warnings.append(f"Vartotojas su ID {student_id} nerastas")
                        continue
            
            # Grąžina rezultatą
            result = {
                "message": f"Sėkmingai sukurti {len(created_plans)} planai",
                "created_count": len(created_plans),
                "warnings": warnings if warnings else None
            }
            
            return Response(result, status=status.HTTP_201_CREATED)
            
        except LessonSequence.DoesNotExist:
            return Response(
                {"error": "Pamokų seka nerasta"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Atnaujina plano statusą"""
        plan = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(IMUPlan.STATUS_CHOICES):
            return Response(
                {"error": "Netinkamas statusas"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Automatiškai nustato laikus pagal statusą
        if new_status == 'in_progress' and not plan.started_at:
            plan.started_at = timezone.now()
        elif new_status == 'completed' and not plan.completed_at:
            plan.completed_at = timezone.now()
        
        plan.status = new_status
        plan.save()
        
        serializer = self.get_serializer(plan)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def student_plans(self, request):
        """Gauna konkretaus mokinio planus"""
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {"error": "Reikalingas student_id parametras"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plans = self.queryset.filter(student_id=student_id)
        serializer = self.get_serializer(plans, many=True)
        return Response(serializer.data)
