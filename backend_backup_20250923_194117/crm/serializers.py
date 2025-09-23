# /backend/crm/serializers.py

# CRM serializers for A-DIENYNAS system
# Defines serializers for student-parent, student-curator, and mentor-subject relationships
# CHANGE: Pašalintas duplikatinis CustomTokenObtainPairSerializer, kad nė būtų konfliktų

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)

# Relationship Serializers
class StudentParentSerializer(serializers.ModelSerializer):
    """
    Mokinio-tėvų santykio serializeris
    """
    class Meta:
        model = StudentParent
        fields = '__all__'

class StudentCuratorSerializer(serializers.ModelSerializer):
    """
    Mokinio-kuratoriaus santykio serializeris
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_first_name = serializers.CharField(source='student.first_name', read_only=True)
    student_last_name = serializers.CharField(source='student.last_name', read_only=True)
    
    class Meta:
        model = StudentCurator
        fields = [
            'id', 'student', 'curator', 'start_date', 'end_date', 
            'created_at', 'updated_at', 'student_name', 'student_email',
            'student_first_name', 'student_last_name'
        ]
        read_only_fields = ('created_at', 'updated_at')

class StudentSubjectLevelSerializer(serializers.ModelSerializer):
    """
    Mokinio dalyko lygio serializeris - valdo mokinių dalykų ir lygių duomenų serializavimą
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    level_name = serializers.CharField(source='level.name', read_only=True)
    
    class Meta:
        model = StudentSubjectLevel
        fields = [
            'id', 'student', 'subject', 'level', 'created_at', 'updated_at',
            'student_name', 'student_email', 'subject_name', 'level_name'
        ]
        read_only_fields = ('created_at', 'updated_at')

class MentorSubjectSerializer(serializers.ModelSerializer):
    """
    Mentoriaus dalyko serializeris
    """
    class Meta:
        model = MentorSubject
        fields = '__all__'



 