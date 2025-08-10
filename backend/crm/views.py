from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    CustomTokenObtainPairSerializer,
    StudentParentSerializer,
    StudentCuratorSerializer,
    StudentSubjectLevelSerializer,
    MentorSubjectSerializer
)
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT token gavimo view - valdo prisijungimo procesą
    """
    serializer_class = CustomTokenObtainPairSerializer

# Relationship Views
class StudentParentViewSet(viewsets.ModelViewSet):
    """
    Mokinio-tėvų santykio viewset - valdo mokinių ir tėvų ryšius
    """
    queryset = StudentParent.objects.all()
    serializer_class = StudentParentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.has_role('parent'):
            return StudentParent.objects.filter(parent=self.request.user)
        elif self.request.user.has_role('student'):
            return StudentParent.objects.filter(student=self.request.user)
        return super().get_queryset()

class StudentCuratorViewSet(viewsets.ModelViewSet):
    """
    Mokinio-kuratoriaus santykio viewset - valdo mokinių ir kuratorių ryšius
    """
    queryset = StudentCurator.objects.all()
    serializer_class = StudentCuratorSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.has_role('curator'):
            return StudentCurator.objects.filter(curator=self.request.user)
        elif self.request.user.has_role('student'):
            return StudentCurator.objects.filter(student=self.request.user)
        return super().get_queryset()

class StudentSubjectLevelViewSet(viewsets.ModelViewSet):
    """
    Mokinio dalyko lygio viewset - valdo mokinių dalykų ir lygių informaciją
    """
    queryset = StudentSubjectLevel.objects.all()
    serializer_class = StudentSubjectLevelSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.has_role('student'):
            return StudentSubjectLevel.objects.filter(student=self.request.user)
        return super().get_queryset()

class MentorSubjectViewSet(viewsets.ModelViewSet):
    """
    Mentoriaus dalyko viewset - valdo mentorių dalykų informaciją
    """
    queryset = MentorSubject.objects.all()
    serializer_class = MentorSubjectSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.has_role('mentor'):
            return MentorSubject.objects.filter(mentor=self.request.user)
        return super().get_queryset()

    @action(detail=False, methods=['get'])
    def my_subjects(self, request):
        """Grąžina prisijungusio mentoriaus dalykus su pilna informacija"""
        if not request.user.has_role('mentor'):
            return Response(
                {'error': 'Tik mentoriai gali matyti savo dalykus'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        mentor_subjects = MentorSubject.objects.filter(
            mentor=request.user
        ).select_related('subject').order_by('subject__name')
        
        subjects_data = []
        for mentor_subject in mentor_subjects:
            subjects_data.append({
                'id': mentor_subject.subject.id,
                'name': mentor_subject.subject.name,
                'description': mentor_subject.subject.description or '',
                'mentor_subject_id': mentor_subject.id
            })
        
        return Response(subjects_data, status=status.HTTP_200_OK)




