# backend/grades/serializers.py
from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    """
    Pažymių serializeris - valdo pažymių duomenų serializavimą
    """
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    grade_letter = serializers.CharField(read_only=True)
    grade_description = serializers.CharField(read_only=True)

    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at') 