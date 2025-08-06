from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from .models import Period, Classroom, GlobalSchedule
from .serializers import PeriodSerializer, ClassroomSerializer, GlobalScheduleSerializer


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
    """
    queryset = GlobalSchedule.objects.all()
    serializer_class = GlobalScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtruojame tvarkaraštį pagal vartotojo roles
        """
        user = self.request.user
        
        if user.has_role('admin'):
            return GlobalSchedule.objects.all()
        elif user.has_role('mentor'):
            return GlobalSchedule.objects.filter(user=user)
        elif user.has_role('student'):
            # Studentai mato tvarkaraštį pagal savo dalykus ir lygius
            return GlobalSchedule.objects.filter(
                subject__in=user.subject_levels.values_list('subject', flat=True),
                level__in=user.subject_levels.values_list('level', flat=True)
            )
        else:
            return GlobalSchedule.objects.none()
    
    def perform_create(self, serializer):
        """
        Sukuria tvarkaraščio įrašą su vartotojo validacija
        """
        user = self.request.user
        
        # Tikriname, ar vartotojas gali kurti tvarkaraštį
        if not user.has_role('mentor') and not user.has_role('admin'):
            from rest_framework import serializers
            raise serializers.ValidationError('Tik mentoriai ir administratoriai gali kurti tvarkaraštį')
        
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """
        Grąžina savaitės tvarkaraštį
        """
        from datetime import datetime, timedelta
        
        # Gauname savaitės pradžią iš parametro arba einamą savaitę
        week_start_param = request.query_params.get('week_start')
        if week_start_param:
            try:
                week_start = datetime.strptime(week_start_param, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Neteisingas datos formatas. Naudokite YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Gauname savaitės pradžią (pirmadienis)
            today = datetime.now().date()
            week_start = today - timedelta(days=today.weekday())
        
        # Filtruojame pagal vartotojo roles
        queryset = self.get_queryset()
        weekly_schedule = queryset.filter(
            date__gte=week_start,
            date__lt=week_start + timedelta(days=7)
        ).order_by('date', 'period__starttime')
        
        serializer = self.get_serializer(weekly_schedule, many=True)
        return Response(serializer.data)
    
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
        
        # Filtruojame pagal vartotojo roles
        queryset = self.get_queryset()
        daily_schedule = queryset.filter(date=target_date).order_by('period__starttime')
        
        serializer = self.get_serializer(daily_schedule, many=True)
        return Response(serializer.data)
    
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
