from rest_framework import serializers
from .models import (
    Subject, Level, Topic, Objective, Component, Skill, 
    Competency, Virtue, Focus, Lesson, Grade
)

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = '__all__'

class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class CompetencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Competency
        fields = '__all__'

class VirtueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Virtue
        fields = '__all__'

class FocusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Focus
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    levels_names = serializers.SerializerMethodField()
    objectives_names = serializers.SerializerMethodField()
    components_names = serializers.SerializerMethodField()
    skills_names = serializers.SerializerMethodField()
    competencies_names = serializers.SerializerMethodField()
    virtues_names = serializers.SerializerMethodField()
    focus_names = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def get_levels_names(self, obj):
        return [level.name for level in obj.levels.all()]

    def get_objectives_names(self, obj):
        return [objective.name for objective in obj.objectives.all()]

    def get_components_names(self, obj):
        return [component.name for component in obj.components.all()]

    def get_skills_names(self, obj):
        return [skill.name for skill in obj.skills.all()]

    def get_competencies_names(self, obj):
        return [competency.name for competency in obj.competencies.all()]

    def get_virtues_names(self, obj):
        return [virtue.name for virtue in obj.virtues.all()]

    def get_focus_names(self, obj):
        return [focus.name for focus in obj.focus.all()]

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    grade_letter = serializers.CharField(read_only=True)
    grade_description = serializers.CharField(read_only=True)

    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at') 