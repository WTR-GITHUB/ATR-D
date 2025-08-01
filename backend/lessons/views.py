from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import (
    Subject, Level, Topic, Objective, Component, Skill,
    Competency, Virtue, Focus, Lesson, Grade
)
from .serializers import (
    SubjectSerializer, LevelSerializer, TopicSerializer, ObjectiveSerializer,
    ComponentSerializer, SkillSerializer, CompetencySerializer, VirtueSerializer,
    FocusSerializer, LessonSerializer, GradeSerializer
)

User = get_user_model()

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsAuthenticated]

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

class ObjectiveViewSet(viewsets.ModelViewSet):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [IsAuthenticated]

class ComponentViewSet(viewsets.ModelViewSet):
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [IsAuthenticated]

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

class CompetencyViewSet(viewsets.ModelViewSet):
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer
    permission_classes = [IsAuthenticated]

class VirtueViewSet(viewsets.ModelViewSet):
    queryset = Virtue.objects.all()
    serializer_class = VirtueSerializer
    permission_classes = [IsAuthenticated]

class FocusViewSet(viewsets.ModelViewSet):
    queryset = Focus.objects.all()
    serializer_class = FocusSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'mentor':
            return Lesson.objects.filter(mentor=user)
        elif user.role == 'student':
            # Studentai mato pamokas, kuriose dalyvauja
            return Lesson.objects.filter(levels__in=user.subject_levels.values_list('level', flat=True))
        elif user.role == 'admin':
            return Lesson.objects.all()
        else:
            return Lesson.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)

    @action(detail=True, methods=['post'])
    def add_grade(self, request, pk=None):
        """Pridėti pažymį pamokai"""
        lesson = self.get_object()
        student_id = request.data.get('student_id')
        percentage = request.data.get('percentage')
        notes = request.data.get('notes', '')

        if not student_id or percentage is None:
            return Response(
                {'error': 'student_id ir percentage yra privalomi'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            student = User.objects.get(id=student_id, role='student')
        except User.DoesNotExist:
            return Response(
                {'error': 'Mokinys nerastas'}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Patikrinti ar pažymys jau egzistuoja
        grade, created = Grade.objects.get_or_create(
            student=student,
            lesson=lesson,
            defaults={
                'mentor': request.user,
                'percentage': percentage,
                'notes': notes
            }
        )

        if not created:
            # Atnaujinti esamą pažymį
            grade.percentage = percentage
            grade.notes = notes
            grade.save()

        serializer = GradeSerializer(grade)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        """Gauti visus pažymius pamokai"""
        lesson = self.get_object()
        grades = Grade.objects.filter(lesson=lesson)
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'mentor':
            return Grade.objects.filter(mentor=user)
        elif user.role == 'student':
            return Grade.objects.filter(student=user)
        elif user.role == 'admin':
            return Grade.objects.all()
        else:
            return Grade.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)
