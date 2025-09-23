# /backend/curriculum/views.py
# SEC-017: Updated curriculum views with secure role-based permissions
# PURPOSE: Replace vulnerable X-Current-Role header with secure server-side validation
# UPDATES: Added custom permission classes for SEC-017 security fix

from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Subject, Level, Objective, Component, Skill, Competency, Virtue, CompetencyAtcheve, Lesson
from .serializers import (
    SubjectSerializer, LevelSerializer, ObjectiveSerializer, ComponentSerializer,
    SkillSerializer, CompetencySerializer, VirtueSerializer, CompetencyAtcheveSerializer, LessonSerializer
)
from .permissions import (
    ManagerOnlyPermission, MentorOrManagerPermission, CuratorOrManagerPermission,
    AllAuthenticatedPermission, ReadOnlyForStudentsPermission, LessonPermission
)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Dalykų viewset - valdo mokomų dalykų informaciją
    Updated with secure role-based permissions
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [ManagerOnlyPermission]  # SEC-017: Only managers can manage subjects


class LevelViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Mokymo lygių viewset - valdo mokymo lygių informaciją
    Updated with secure role-based permissions
    """
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [ManagerOnlyPermission]  # SEC-017: Only managers can manage levels


class ObjectiveViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Tikslų viewset - valdo pamokų tikslų informaciją
    Updated with secure role-based permissions
    """
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [MentorOrManagerPermission]  # SEC-017: Mentors and managers can manage objectives


class ComponentViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Komponentų viewset - valdo pamokų komponentų informaciją
    Updated with secure role-based permissions
    """
    queryset = Component.objects.all()
    serializer_class = ComponentSerializer
    permission_classes = [MentorOrManagerPermission]  # SEC-017: Mentors and managers can manage components


class SkillViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Gebėjimų viewset - valdo mokinių gebėjimų informaciją
    Updated with secure role-based permissions and proper queryset filtering
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [ReadOnlyForStudentsPermission]  # SEC-017: Students can only read, others can manage

    def get_queryset(self):
        """
        SEC-017: Secure queryset filtering based on validated role
        No longer relies on vulnerable X-Current-Role header
        """
        # Get validated role from middleware (already validated server-side)
        current_role = getattr(self.request, 'current_role', None)
        
        # Base queryset
        queryset = Skill.objects.all()
        
        # Filter by subject_id if provided (with validation)
        subject_id = self.request.query_params.get('subject_id', None)
        if subject_id is not None:
            try:
                # Validate subject_id is numeric to prevent injection
                subject_id = int(subject_id)
                queryset = queryset.filter(subject_id=subject_id)
            except (ValueError, TypeError):
                # Invalid subject_id, return empty queryset
                return Skill.objects.none()
        
        return queryset


class CompetencyViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Kompetencijų viewset - valdo mokinių kompetencijų informaciją
    Updated with secure role-based permissions
    """
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer
    permission_classes = [MentorOrManagerPermission]  # SEC-017: Mentors and managers can manage competencies


class CompetencyAtcheveViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Kompetencijų pasiekimų viewset - valdo kompetencijų pasiekimų informaciją
    Updated with secure role-based permissions and proper queryset filtering
    """
    queryset = CompetencyAtcheve.objects.all()
    serializer_class = CompetencyAtcheveSerializer
    permission_classes = [ReadOnlyForStudentsPermission]  # SEC-017: Students can only read, others can manage
    
    def get_queryset(self):
        """
        SEC-017: Secure queryset filtering based on validated role
        No longer relies on vulnerable X-Current-Role header
        """
        # Get validated role from middleware (already validated server-side)
        current_role = getattr(self.request, 'current_role', None)
        
        # Base queryset
        queryset = CompetencyAtcheve.objects.all()
        
        # Filter by subject_id if provided (with validation)
        subject_id = self.request.query_params.get('subject_id', None)
        if subject_id is not None:
            try:
                # Validate subject_id is numeric to prevent injection
                subject_id = int(subject_id)
                queryset = queryset.filter(subject_id=subject_id)
            except (ValueError, TypeError):
                # Invalid subject_id, return empty queryset
                return CompetencyAtcheve.objects.none()
        
        return queryset


class VirtueViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Dorybių viewset - valdo ugdomų dorybių informaciją
    Updated with secure role-based permissions
    """
    queryset = Virtue.objects.all()
    serializer_class = VirtueSerializer
    permission_classes = [CuratorOrManagerPermission]  # SEC-017: Curators and managers can manage virtues


class LessonViewSet(viewsets.ModelViewSet):
    """
    SEC-017: Pamokų viewset - valdo ugdymo planų šablonų informaciją
    Updated with secure role-based permissions and proper object-level permissions
    """
    serializer_class = LessonSerializer
    permission_classes = [LessonPermission]  # SEC-017: Custom permission class with complex role logic

    def get_queryset(self):
        """
        SEC-017: Secure queryset filtering based on validated role
        No longer relies on vulnerable X-Current-Role header
        """
        # Get validated role from middleware (already validated server-side)
        current_role = getattr(self.request, 'current_role', None)
        user = self.request.user
        
        if current_role == 'mentor':
            # Mentors can see their own lessons
            return Lesson.objects.filter(mentor=user)
        elif current_role == 'student':
            # Students can see lessons they're enrolled in
            try:
                return Lesson.objects.filter(levels__in=user.subject_levels.values_list('level', flat=True))
            except AttributeError:
                # If user doesn't have subject_levels, return empty queryset
                return Lesson.objects.none()
        elif current_role == 'curator':
            # Curators can see lessons for their students
            try:
                from crm.models import StudentCurator
                curated_students = StudentCurator.objects.filter(curator=user).values_list('student', flat=True)
                return Lesson.objects.filter(levels__in=user.subject_levels.filter(student__in=curated_students).values_list('level', flat=True)).distinct()
            except (AttributeError, ImportError):
                # If models don't exist or user doesn't have subject_levels, return empty queryset
                return Lesson.objects.none()
        elif current_role in ['admin', 'manager']:
            # Managers and admins can see all lessons
            return Lesson.objects.all()
        else:
            # Unknown role, return empty queryset
            return Lesson.objects.none()

    def perform_create(self, serializer):
        """
        SEC-017: Secure lesson creation - automatically assign mentor
        """
        serializer.save(mentor=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """
        SEC-017: Secure soft delete - only authorized users can delete
        """
        instance = self.get_object()
        # Use model's soft delete method
        instance.delete()  # This calls the model's delete() method which does soft delete
        return Response(status=status.HTTP_204_NO_CONTENT)