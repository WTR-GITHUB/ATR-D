from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import (
    StudentParent,
    StudentCurator,
    StudentSubjectLevel,
    MentorSubject
)

# Authentication Serializers
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    JWT token serializeris - sukuria prisijungimo tokenus su papildoma informacija
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email'] = user.email
        token['roles'] = user.roles
        token['full_name'] = f"{user.first_name} {user.last_name}"
        return token

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
    class Meta:
        model = StudentCurator
        fields = '__all__'

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



 