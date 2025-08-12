# /backend/curriculum/views.py
from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subject, Level, Objective, Component, Skill, Competency, Virtue, CompetencyAtcheve, Lesson
from .serializers import (
    SubjectSerializer, LevelSerializer, ObjectiveSerializer, ComponentSerializer,
    SkillSerializer, CompetencySerializer, VirtueSerializer, CompetencyAtcheveSerializer, LessonSerializer
)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    Dalykų viewset - valdo mokomų dalykų informaciją
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]


class LevelViewSet(viewsets.ModelViewSet):
    """
    Mokymo lygių viewset - valdo mokymo lygių informaciją
    """
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [IsAuthenticated]


class ObjectiveViewSet(viewsets.ModelViewSet):
    """
    Tikslų viewset - valdo pamokų tikslų informaciją
    """
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [IsAuthenticated]


class ComponentViewSet(viewsets.ModelViewSet):
    """
    Komponentų viewset - valdo pamokų komponentų informaciją
    """
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [IsAuthenticated]


class SkillViewSet(viewsets.ModelViewSet):
    """
    Gebėjimų viewset - valdo mokinių gebėjimų informaciją
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Skill.objects.all()
        subject_id = self.request.query_params.get('subject_id', None)
        if subject_id is not None:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset


class CompetencyViewSet(viewsets.ModelViewSet):
    """
    Kompetencijų viewset - valdo mokinių kompetencijų informaciją
    """
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer
    permission_classes = [IsAuthenticated]


class CompetencyAtcheveViewSet(viewsets.ModelViewSet):
    """
    Kompetencijų pasiekimų viewset - valdo kompetencijų pasiekimų informaciją
    """
    queryset = CompetencyAtcheve.objects.all()
    serializer_class = CompetencyAtcheveSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = CompetencyAtcheve.objects.all()
        subject_id = self.request.query_params.get('subject_id', None)
        if subject_id is not None:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset


class VirtueViewSet(viewsets.ModelViewSet):
    """
    Dorybių viewset - valdo ugdomų dorybių informaciją
    """
    queryset = Virtue.objects.all()
    serializer_class = VirtueSerializer
    permission_classes = [IsAuthenticated]


class LessonViewSet(viewsets.ModelViewSet):
    """
    Pamokų viewset - valdo ugdymo planų šablonų informaciją
    """
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.has_role('mentor'):
            return Lesson.objects.filter(mentor=user)
        elif user.has_role('student'):
            # Studentai mato pamokas, kuriose dalyvauja
            return Lesson.objects.filter(levels__in=user.subject_levels.values_list('level', flat=True))
        elif user.has_role('admin'):
            return Lesson.objects.all()
        else:
            return Lesson.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)
