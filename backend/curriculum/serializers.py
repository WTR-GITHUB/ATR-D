from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Subject, Level, Objective, Component, Skill, Competency, Virtue, CompetencyAtcheve, Lesson
import json


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
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
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


class CompetencyAtcheveSerializer(serializers.ModelSerializer):
    """
    Kompetencijų pasiekimų serializeris
    """
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    virtues_names = serializers.SerializerMethodField()
    todos_list = serializers.SerializerMethodField()
    
    class Meta:
        model = CompetencyAtcheve
        fields = '__all__'
    
    def get_virtues_names(self, obj):
        return [v.name for v in obj.virtues.all()]
    
    def get_todos_list(self, obj):
        if obj.todos:
            try:
                return json.loads(obj.todos)
            except:
                return []
        return []


class VirtueSerializer(serializers.ModelSerializer):
    """
    Dorybių serializeris
    """
    class Meta:
        model = Virtue
        fields = '__all__'


class LessonSerializer(serializers.ModelSerializer):
    """
    Pamokų serializeris - valdo pamokų duomenų serializavimą
    """
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    mentor = serializers.PrimaryKeyRelatedField(queryset=get_user_model().objects.filter(roles__contains=['mentor']), required=False, allow_null=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    topic_name = serializers.CharField(source='topic', read_only=True)
    title = serializers.CharField(required=True)
    topic = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    assessment_criteria = serializers.CharField(required=False, allow_blank=True)
    levels_names = serializers.SerializerMethodField()
    objectives_list = serializers.SerializerMethodField()
    objectives = serializers.CharField(required=False, allow_blank=True)
    components_list = serializers.SerializerMethodField()
    components = serializers.CharField(required=False, allow_blank=True)
    skills_list = serializers.SerializerMethodField()
    skills = serializers.PrimaryKeyRelatedField(many=True, queryset=Skill.objects.all(), required=False)
    competencies_list = serializers.SerializerMethodField()
    competencies = serializers.CharField(required=False, allow_blank=True)
    virtues_names = serializers.SerializerMethodField()
    focus_list = serializers.SerializerMethodField()
    focus = serializers.CharField(required=False, allow_blank=True)
    # Pasiekimo lygiai
    slenkstinis = serializers.CharField(required=False, allow_blank=True)
    bazinis = serializers.CharField(required=False, allow_blank=True)
    pagrindinis = serializers.CharField(required=False, allow_blank=True)
    aukstesnysis = serializers.CharField(required=False, allow_blank=True)
    # Kompetencijos pasiekimai
    competency_atcheve_name = serializers.SerializerMethodField()
    competency_atcheves = serializers.PrimaryKeyRelatedField(many=True, queryset=CompetencyAtcheve.objects.all(), required=False)
    # --- PRIDĖTA ---
    virtues = serializers.PrimaryKeyRelatedField(many=True, queryset=Virtue.objects.all(), required=False)
    levels = serializers.PrimaryKeyRelatedField(many=True, queryset=Level.objects.all(), required=False)
    # ---------------

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'topic', 'description', 'assessment_criteria',
            'objectives', 'components', 'skills', 'competencies', 'focus',
            'slenkstinis', 'bazinis', 'pagrindinis', 'aukstesnysis',
            'subject', 'mentor', 'competency_atcheves', 'virtues', 'levels',
            'created_at', 'updated_at',
            # Read-only fields for display
            'mentor_name', 'subject_name', 'topic_name',
            'levels_names', 'objectives_list', 'components_list',
            'skills_list', 'competencies_list', 'virtues_names',
            'focus_list', 'competency_atcheve_name'
        ]
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
        return [skill.id for skill in obj.skills.all()]

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

    def get_competency_atcheve_name(self, obj):
        return [f"{atcheve.competency.name} - {', '.join([v.name for v in atcheve.virtues.all()])}" for atcheve in obj.competency_atcheves.all()]

    def create(self, validated_data):
        """
        Sukuria pamoką su ManyToMany laukais
        """
        print(f"Creating lesson with data: {validated_data}")
        
        # Išimti ManyToMany laukus iš validated_data
        virtues_data = validated_data.pop('virtues', [])
        levels_data = validated_data.pop('levels', [])
        skills_data = validated_data.pop('skills', [])
        competency_atcheves_data = validated_data.pop('competency_atcheves', [])
        
        print(f"Virtues data: {virtues_data}")
        print(f"Levels data: {levels_data}")
        print(f"Competency atcheves data: {competency_atcheves_data}")
        
        # Sukurti pamoką
        lesson = Lesson.objects.create(**validated_data)
        
        # Pridėti ManyToMany laukus
        lesson.virtues.set(virtues_data)
        lesson.levels.set(levels_data)
        lesson.skills.set(skills_data)
        
        # Pridėti competency_atcheves
        lesson.competency_atcheves.set(competency_atcheves_data)
        
        print(f"Created lesson: {lesson}")
        return lesson

    def update(self, instance, validated_data):
        """
        Atnaujina pamoką su ManyToMany laukais
        """
        print(f"Updating lesson {instance.id} with data: {validated_data}")
        
        # Išimti ManyToMany laukus iš validated_data
        virtues_data = validated_data.pop('virtues', None)
        levels_data = validated_data.pop('levels', None)
        skills_data = validated_data.pop('skills', None)
        competency_atcheves_data = validated_data.pop('competency_atcheves', None)
        
        print(f"Virtues data: {virtues_data}")
        print(f"Levels data: {levels_data}")
        print(f"Competency atcheves data: {competency_atcheves_data}")
        
        # Atnaujinti kitus laukus
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atnaujinti ManyToMany laukus, jei pateikti
        if virtues_data is not None:
            instance.virtues.set(virtues_data)
        if levels_data is not None:
            instance.levels.set(levels_data)
        if skills_data is not None:
            instance.skills.set(skills_data)
        if competency_atcheves_data is not None:
            instance.competency_atcheves.set(competency_atcheves_data)
        
        print(f"Updated lesson: {instance}")
        return instance 