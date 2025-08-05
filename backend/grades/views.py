from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Grade
from .serializers import GradeSerializer


# Create your views here.


class GradeViewSet(viewsets.ModelViewSet):
    """
    Pažymių viewset - valdo mokinių pažymių informaciją
    """
    serializer_class = GradeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.has_role('mentor'):
            return Grade.objects.filter(mentor=user)
        elif user.has_role('student'):
            return Grade.objects.filter(student=user)
        elif user.has_role('admin'):
            return Grade.objects.all()
        else:
            return Grade.objects.none()

    def perform_create(self, serializer):
        serializer.save(mentor=self.request.user)
