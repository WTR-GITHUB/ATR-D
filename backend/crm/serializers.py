from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
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
        token['role'] = user.role
        token['full_name'] = f"{user.first_name} {user.last_name}"
        return token

# User Serializers
class UserSerializer(serializers.ModelSerializer):
    """
    Vartotojų serializeris - valdo vartotojų duomenų serializavimą
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'birth_date', 
                 'phone_number', 'contract_number', 'is_active')
        read_only_fields = ('last_login', 'date_joined')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

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
    Mokinio dalyko lygio serializeris
    """
    class Meta:
        model = StudentSubjectLevel
        fields = '__all__'

class MentorSubjectSerializer(serializers.ModelSerializer):
    """
    Mentoriaus dalyko serializeris
    """
    class Meta:
        model = MentorSubject
        fields = '__all__'

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

# Lesson Components Serializers
class SubjectSerializer(serializers.ModelSerializer):
    """
    Dalykų serializeris
    """
    class Meta:
        model = Subject
        fields = '__all__'

class LevelSerializer(serializers.ModelSerializer):
    """
    Mokymo lygių serializeris
    """
    class Meta:
        model = Level
        fields = '__all__'



class ObjectiveSerializer(serializers.ModelSerializer):
    """
    Tikslų serializeris
    """
    class Meta:
        model = Objective
        fields = '__all__'

class ComponentSerializer(serializers.ModelSerializer):
    """
    Komponentų serializeris
    """
    class Meta:
        model = Component
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    """
    Gebėjimų serializeris
    """
    class Meta:
        model = Skill
        fields = '__all__'

class CompetencySerializer(serializers.ModelSerializer):
    """
    Kompetencijų serializeris
    """
    class Meta:
        model = Competency
        fields = '__all__'

class VirtueSerializer(serializers.ModelSerializer):
    """
    Dorybių serializeris
    """
    class Meta:
        model = Virtue
        fields = '__all__'

class FocusSerializer(serializers.ModelSerializer):
    """
    Dėmesio krypčių serializeris
    """
    class Meta:
        model = Focus
        fields = '__all__'

import json

class LessonSerializer(serializers.ModelSerializer):
    """
    Pamokų serializeris - valdo pamokų duomenų serializavimą
    """
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    topic_name = serializers.CharField(source='topic', read_only=True)
    levels_names = serializers.SerializerMethodField()
    objectives_list = serializers.SerializerMethodField()
    components_list = serializers.SerializerMethodField()
    skills_list = serializers.SerializerMethodField()
    competencies_list = serializers.SerializerMethodField()
    virtues_names = serializers.SerializerMethodField()
    focus_list = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_levels_names(self, obj):
        return [level.name for level in obj.levels.all()]

    def get_objectives_list(self, obj):
        if obj.objectives:
            try:
                return json.loads(obj.objectives)
            except:
                return []
        return []

    def get_components_list(self, obj):
        if obj.components:
            try:
                return json.loads(obj.components)
            except:
                return []
        return []

    def get_skills_list(self, obj):
        if obj.skills:
            try:
                return json.loads(obj.skills)
            except:
                return []
        return []

    def get_competencies_list(self, obj):
        if obj.competencies:
            try:
                return json.loads(obj.competencies)
            except:
                return []
        return []

    def get_virtues_names(self, obj):
        return [virtue.name for virtue in obj.virtues.all()]

    def get_focus_list(self, obj):
        if obj.focus:
            try:
                return json.loads(obj.focus)
            except:
                return []
        return [] 