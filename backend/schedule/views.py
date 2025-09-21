# backend/schedule/views.py
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from .models import Period, Classroom, GlobalSchedule
from .serializers import PeriodSerializer, ClassroomSerializer, GlobalScheduleSerializer
from plans.models import IMUPlan
from curriculum.models import Lesson


# Create your views here.


class PeriodViewSet(viewsets.ModelViewSet):
    """
    Periodų viewset - valdo pamokų periodų informaciją
    """
    queryset = Period.objects.all()
    serializer_class = PeriodSerializer
    permission_classes = [IsAuthenticated]


class ClassroomViewSet(viewsets.ModelViewSet):
    """
    Klasės viewset - valdo klasės informaciją
    """
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [IsAuthenticated]


class GlobalScheduleViewSet(viewsets.ModelViewSet):
    """
    Globalaus tvarkaraščio viewset - valdo tvarkaraščio informaciją
    REFAKTORINIMAS: Pridėti plan_status, started_at, completed_at valdymas
    """
    queryset = GlobalSchedule.objects.all()
    serializer_class = GlobalScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtruojame tvarkaraštį pagal vartotojo roles
        CHANGE: Naudojame X-Current-Role header dabartinės rolės nustatymui
        """
        user = self.request.user
        
        # CHANGE: Paimame dabartinę rolę iš header
        current_role = self.request.headers.get('X-Current-Role')
        if not current_role:
            current_role = getattr(user, 'default_role', None)
        
        print(f"🔍 GET_QUERYSET DEBUG:")
        print(f"   👤 Vartotojas: {user.email}")
        print(f"   🎭 Rolės: {user.roles}")
        print(f"   🔄 Dabartinė rolė: {current_role}")
        
        if current_role == 'admin':
            queryset = GlobalSchedule.objects.all()
            print(f"   🔑 ADMIN: Grąžinami visi įrašai ({queryset.count()})")
            return queryset
        elif current_role == 'mentor':
            # Mentoriai mato tik tuos dalykus, kurie jiems priskirti
            mentor_subjects = user.mentor_subjects.values_list('subject', flat=True)
            print(f"   🎓 MENTOR: Priskirti dalykai: {list(mentor_subjects)}")
            
            # DEBUG: Patikriname kiekvieną sąlygą atskirai
            all_schedules = GlobalSchedule.objects.all()
            print(f"   📊 Iš viso GlobalSchedule įrašų: {all_schedules.count()}")
            
            user_schedules = GlobalSchedule.objects.filter(user=user)
            print(f"   👤 Schedules su user={user.id}: {user_schedules.count()}")
            
            subject_schedules = GlobalSchedule.objects.filter(subject__in=mentor_subjects)
            print(f"   📚 Schedules su mentor_subjects: {subject_schedules.count()}")
            
            queryset = GlobalSchedule.objects.filter(
                user=user,
                subject__in=mentor_subjects
            )
            print(f"   ✅ GALUTINIS MENTOR QUERYSET: {queryset.count()} įrašų")
            
            # DEBUG: Loguojame kiekvieną rezultatą
            for schedule in queryset:
                print(f"      📝 ID: {schedule.id}, Dalykas: {schedule.subject.name}, Mentorius: {schedule.user.email}, Data: {schedule.date}")
            
            return queryset
        elif current_role == 'student':
            # Studentai mato tvarkaraštį pagal savo dalykus ir lygius
            queryset = GlobalSchedule.objects.filter(
                subject__in=user.subject_levels.values_list('subject', flat=True),
                level__in=user.subject_levels.values_list('level', flat=True)
            )
            print(f"   🎒 STUDENT: Grąžinami įrašai ({queryset.count()})")
            return queryset
        else:
            print(f"   ❌ NO ROLE: Grąžinamas tuščias queryset")
            return GlobalSchedule.objects.none()
    
    def perform_create(self, serializer):
        """
        Sukuria tvarkaraščio įrašą su vartotojo validacija
        """
        user = self.request.user
        
        # CHANGE: Naudojame X-Current-Role header teisių patikrinimui
        current_role = self.request.headers.get('X-Current-Role')
        if not current_role:
            current_role = getattr(user, 'default_role', None)
        
        # Tikriname, ar vartotojas gali kurti tvarkaraštį
        if current_role not in ['mentor', 'admin']:
            from rest_framework import serializers
            raise serializers.ValidationError('Tik mentoriai ir administratoriai gali kurti tvarkaraštį')
        
        # Jei mentorius, tikriname, ar dalykas jam priskirtas
        if current_role == 'mentor':
            subject = serializer.validated_data.get('subject')
            if subject and not user.mentor_subjects.filter(subject=subject).exists():
                from rest_framework import serializers
                raise serializers.ValidationError('Jums nepriskirtas šis dalykas')
        
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """
        Grąžina savaitės tvarkaraštį
        """
        from datetime import datetime, timedelta
        
        # Gauname šios savaitės datas
        today = datetime.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)
        
        schedules = self.get_queryset().filter(
            date__range=[start_of_week, end_of_week]
        ).select_related('period', 'classroom', 'subject', 'level', 'user')
        
        serializer = self.get_serializer(schedules, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start_activity(self, request, pk=None):
        """
        REFAKTORINIMAS: Pradeda veiklą (GlobalSchedule plan_status -> 'in_progress')
        """
        schedule = self.get_object()
        
        # Tikriname, ar veikla gali būti pradėta
        if schedule.plan_status != 'planned':
            return Response(
                {"error": "Veikla gali būti pradėta tik iš 'planned' būsenos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Pradedame veiklą
        result = GlobalSchedule.bulk_start_activity(schedule.id)
        
        # Atnaujiname objektą iš duomenų bazės
        schedule.refresh_from_db()
        
        return Response({
            "message": "Veikla sėkmingai pradėta",
            "plan_status": schedule.plan_status,
            "started_at": schedule.started_at,
            "result": result
        })
    
    @action(detail=True, methods=['post'])
    def end_activity(self, request, pk=None):
        """
        REFAKTORINIMAS: Baigia veiklą (GlobalSchedule plan_status -> 'completed')
        """
        schedule = self.get_object()
        
        # Tikriname, ar veikla gali būti baigta
        if schedule.plan_status != 'in_progress':
            return Response(
                {"error": "Veikla gali būti baigta tik iš 'in_progress' būsenos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Baigiame veiklą
        result = GlobalSchedule.bulk_end_activity(schedule.id)
        
        # Atnaujiname objektą iš duomenų bazės
        schedule.refresh_from_db()
        
        return Response({
            "message": "Veikla sėkmingai baigta",
            "plan_status": schedule.plan_status,
            "completed_at": schedule.completed_at,
            "result": result
        })
    
    @action(detail=True, methods=['post'])
    def cancel_activity(self, request, pk=None):
        """
        CHANGE: Atšaukia veiklą (GlobalSchedule plan_status -> 'planned')
        PURPOSE: Grąžina veiklą į suplanuotą būseną ir išvalo laikus
        """
        schedule = self.get_object()
        
        # Tikriname, ar veikla gali būti atšaukta
        if schedule.plan_status not in ['in_progress', 'completed']:
            return Response(
                {"error": "Veikla gali būti atšaukta tik iš 'in_progress' arba 'completed' būsenos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atšaukiame veiklą
        result = GlobalSchedule.bulk_cancel_activity(schedule.id)
        
        # Atnaujiname objektą iš duomenų bazės
        schedule.refresh_from_db()
        
        return Response({
            "message": "Veikla sėkmingai atšaukta",
            "plan_status": schedule.plan_status,
            "started_at": schedule.started_at,
            "completed_at": schedule.completed_at,
            "result": result
        })
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        REFAKTORINIMAS: Atnaujina veiklos plan_status
        """
        schedule = self.get_object()
        new_status = request.data.get('plan_status')
        
        if new_status not in dict(GlobalSchedule.PLAN_STATUS_CHOICES):
            return Response(
                {"error": "Netinkamas plan_status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Automatiškai nustato laikus pagal plan_status
        from django.utils import timezone
        if new_status == 'in_progress' and not schedule.started_at:
            schedule.started_at = timezone.now()
        elif new_status == 'completed' and not schedule.completed_at:
            schedule.completed_at = timezone.now()
        
        schedule.plan_status = new_status
        schedule.save()
        
        return Response({
            "message": "Veiklos būsena sėkmingai atnaujinta",
            "plan_status": schedule.plan_status,
            "started_at": schedule.started_at,
            "completed_at": schedule.completed_at
        })
    
    @action(detail=False, methods=['get'])
    def daily(self, request):
        """
        Grąžina dienos tvarkaraštį
        """
        from datetime import datetime
        
        date_param = request.query_params.get('date')
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Neteisingas datos formatas. Naudokite YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            target_date = datetime.now().date()
        
        # DEBUG: Loguojame užklausos parametrus
        print(f"🔍 DAILY SCHEDULE DEBUG:")
        print(f"   📅 Data: {target_date}")
        print(f"   👤 Vartotojas: {request.user.email}")
        print(f"   🎭 Rolės: {request.user.roles}")
        
        # Filtruojame pagal vartotojo roles
        queryset = self.get_queryset()
        print(f"   📊 Iš viso queryset įrašų: {queryset.count()}")
        
        daily_schedule = queryset.filter(date=target_date).order_by('period__starttime')
        print(f"   📋 Dienos tvarkaraštis ({target_date}): {daily_schedule.count()} įrašų")
        
        # DEBUG: Loguojame kiekvieną įrašą
        for schedule in daily_schedule:
            print(f"      📝 ID: {schedule.id}, Dalykas: {schedule.subject.name}, Mentorius: {schedule.user.email}, Laikas: {schedule.period.starttime}")
        
        serializer = self.get_serializer(daily_schedule, many=True)
        print(f"   ✅ Grąžinami duomenys: {len(serializer.data)} įrašų")
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='mentor-subjects')
    def mentor_subjects(self, request):
        """
        Grąžina mentoriaus priskirtus dalykus
        """
        user = self.request.user
        
        # CHANGE: Naudojame X-Current-Role header teisių patikrinimui
        current_role = request.headers.get('X-Current-Role')
        if not current_role:
            current_role = getattr(user, 'default_role', None)
        
        if current_role != 'mentor':
            return Response(
                {'error': 'Tik mentoriai gali gauti priskirtus dalykus'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        mentor_subjects = user.mentor_subjects.select_related('subject').all()
        print(f"DEBUG: Mentor {user.email} priskirti dalykai count: {mentor_subjects.count()}")
        
        subjects_data = [
            {
                'id': ms.subject.id,
                'name': ms.subject.name,
                'description': ms.subject.description
            }
            for ms in mentor_subjects
        ]
        
        print(f"DEBUG: Grąžinami dalykai: {subjects_data}")
        return Response(subjects_data)
    
    @action(detail=False, methods=['get'])
    def conflicts(self, request):
        """
        Grąžina tvarkaraščio konfliktus
        """
        from django.db.models import Q
        
        queryset = self.get_queryset()
        
        # Ieškome konfliktų (tas pats laikas, ta pati klasė, skirtingos datos)
        conflicts = queryset.values('period', 'classroom').annotate(
            count=models.Count('id')
        ).filter(count__gt=1)
        
        conflict_details = []
        for conflict in conflicts:
            schedules = queryset.filter(
                period=conflict['period'],
                classroom=conflict['classroom']
            )
            conflict_details.append({
                'period': conflict['period'],
                'classroom': conflict['classroom'],
                'schedules': GlobalScheduleSerializer(schedules, many=True).data
            })
        
        return Response(conflict_details)
    
    @action(detail=True, methods=['get'])
    def lesson_id(self, request, pk=None):
        """
        Grąžina lesson ID, susietą su GlobalSchedule per IMUPlan
        """
        try:
            # Gauti GlobalSchedule objektą
            global_schedule = self.get_object()
            
            # Rasti IMUPlan įrašą, susietą su šiuo GlobalSchedule
            imu_plan = IMUPlan.objects.filter(global_schedule=global_schedule).first()
            
            if not imu_plan:
                return Response(
                    {'error': 'Šiai veiklai nėra priskirta pamoka (IMUPlan).'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'lesson_id': imu_plan.lesson.id,
                'imu_plan_id': imu_plan.id,
                'status': imu_plan.status
            })
            
        except Exception as e:
            return Response(
                {'error': f'Klaida gaunant pamokos ID: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
