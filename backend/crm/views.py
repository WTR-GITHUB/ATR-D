from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    CustomTokenObtainPairSerializer,
    StudentParentSerializer,
    StudentCuratorSerializer,
    StudentSubjectLevelSerializer,
    MentorSubjectSerializer,
    GradeSerializer,
    SubjectSerializer,
    LevelSerializer,
    ObjectiveSerializer,
    ComponentSerializer,
    SkillSerializer,
    CompetencySerializer,
    VirtueSerializer,
    FocusSerializer,
    LessonSerializer
)
from .models import (
    User,
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject,
    Grade,
    Subject,
    Level,
    Objective,
    Component,
    Skill,
    Competency,
    Virtue,
    Focus,
    Lesson
)

# Authentication Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Dabartinio vartotojo informacijos endpoint'as - grąžina prisijungusio vartotojo duomenis
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT token gavimo view - valdo prisijungimo procesą
    """
    serializer_class = CustomTokenObtainPairSerializer

# User Views
class UserViewSet(viewsets.ModelViewSet):
    """
    Vartotojų valdymo viewset - valdo vartotojų CRUD operacijas
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(role=role)
        return queryset

# Relationship Views
class StudentParentViewSet(viewsets.ModelViewSet):
    """
    Mokinio-tėvų santykio viewset - valdo mokinių ir tėvų ryšius
    """
    queryset = StudentParent.objects.all()
    serializer_class = StudentParentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.role == User.Role.PARENT:
            return StudentParent.objects.filter(parent=self.request.user)
        elif self.request.user.role == User.Role.STUDENT:
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
        if self.request.user.role == User.Role.CURATOR:
            return StudentCurator.objects.filter(curator=self.request.user)
        elif self.request.user.role == User.Role.STUDENT:
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
        if self.request.user.role == User.Role.STUDENT:
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
        if self.request.user.role == User.Role.MENTOR:
            return MentorSubject.objects.filter(mentor=self.request.user)
        return super().get_queryset()

class GradeViewSet(viewsets.ModelViewSet):
    """
    Pažymių viewset - valdo mokinių pažymių informaciją
    """
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

# Lesson Components Views
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

class CompetencyViewSet(viewsets.ModelViewSet):
    """
    Kompetencijų viewset - valdo mokinių kompetencijų informaciją
    """
    queryset = Competency.objects.all()
    serializer_class = CompetencySerializer
    permission_classes = [IsAuthenticated]

class VirtueViewSet(viewsets.ModelViewSet):
    """
    Dorybių viewset - valdo ugdomų dorybių informaciją
    """
    queryset = Virtue.objects.all()
    serializer_class = VirtueSerializer
    permission_classes = [IsAuthenticated]

class FocusViewSet(viewsets.ModelViewSet):
    """
    Dėmesio krypčių viewset - valdo pamokų dėmesio krypčių informaciją
    """
    queryset = Focus.objects.all()
    serializer_class = FocusSerializer
    permission_classes = [IsAuthenticated]

class LessonViewSet(viewsets.ModelViewSet):
    """
    Pamokų viewset - valdo ugdymo planų šablonų informaciją
    """
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
