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
    MentorSubjectSerializer
)
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)
from lessons.models import Subject, Level

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Grąžina dabartinio vartotojo informaciją"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role', None)
        if role is not None:
            queryset = queryset.filter(role=role)
        return queryset

class StudentParentViewSet(viewsets.ModelViewSet):
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
    queryset = StudentSubjectLevel.objects.all()
    serializer_class = StudentSubjectLevelSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.role == User.Role.STUDENT:
            return StudentSubjectLevel.objects.filter(student=self.request.user)
        return super().get_queryset()

class MentorSubjectViewSet(viewsets.ModelViewSet):
    queryset = MentorSubject.objects.all()
    serializer_class = MentorSubjectSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        if self.request.user.role == User.Role.MENTOR:
            return MentorSubject.objects.filter(mentor=self.request.user)
        return super().get_queryset()
