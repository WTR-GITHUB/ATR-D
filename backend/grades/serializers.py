# backend/grades/serializers.py

# Grades aplikacijos serializers - API duomenų serializavimas
# CHANGE: Sukurtas naujas serializers.py failas su AchievementLevel ir Grade serializers

from rest_framework import serializers
from .models import AchievementLevel, Grade, GradeCalculation


class AchievementLevelSerializer(serializers.ModelSerializer):
    """
    Pasiekimų lygių serializer
    """
    class Meta:
        model = AchievementLevel
        fields = ['id', 'code', 'name', 'min_percentage', 'max_percentage', 'color', 'description']


class GradeCalculationSerializer(serializers.ModelSerializer):
    """
    Pasiekimų lygio skaičiavimo serializer
    """
    calculated_level = AchievementLevelSerializer(read_only=True)
    
    class Meta:
        model = GradeCalculation
        fields = ['id', 'percentage', 'calculated_level', 'calculation_date']


class GradeSerializer(serializers.ModelSerializer):
    """
    Mokinių vertinimų serializer su automatinio skaičiavimo funkcionalumu
    CHANGE: Pridėtas automatinis pasiekimų lygio skaičiavimas
    """
    achievement_level = AchievementLevelSerializer(read_only=True)
    achievement_level_id = serializers.IntegerField(write_only=True, required=False)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    mentor_name = serializers.CharField(source='mentor.get_full_name', read_only=True)
    imu_plan_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Grade
        fields = [
            'id', 'student', 'student_name', 'lesson', 'lesson_title',
            'mentor', 'mentor_name', 'achievement_level', 'achievement_level_id',
            'percentage', 'imu_plan', 'imu_plan_info', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_imu_plan_info(self, obj):
        """Rodo IMU plano informaciją"""
        if obj.imu_plan:
            return {
                'id': obj.imu_plan.id,
                'attendance_status': obj.imu_plan.attendance_status,
                'global_schedule_id': obj.imu_plan.global_schedule.id
            }
        return None
    
    def validate(self, data):
        """
        Validacija: tikriname duomenų teisingumą
        CHANGE: Pridėta validacija pasiekimų lygio ir procentų atitikimo
        """
        # Tikriname, ar procentai atitinka pasiekimų lygį
        percentage = data.get('percentage')
        achievement_level_id = data.get('achievement_level_id')
        
        if percentage is not None and achievement_level_id is not None:
            try:
                achievement_level = AchievementLevel.objects.get(id=achievement_level_id)
                if not (achievement_level.min_percentage <= percentage <= achievement_level.max_percentage):
                    raise serializers.ValidationError(
                        f'Procentai {percentage}% neatitinka pasiekimų lygio {achievement_level.name} '
                        f'({achievement_level.min_percentage}-{achievement_level.max_percentage}%)'
                    )
            except AchievementLevel.DoesNotExist:
                raise serializers.ValidationError('Neteisingas pasiekimų lygis')
        
        return data
    
    def create(self, validated_data):
        """
        Sukuriamas naujas vertinimas su automatinio pasiekimų lygio nustatymu
        CHANGE: Automatinis pasiekimų lygio skaičiavimas
        """
        percentage = validated_data.get('percentage')
        
        # Automatiškai nustatome pasiekimų lygį pagal procentus
        if percentage is not None:
            achievement_level = AchievementLevel.get_level_by_percentage(percentage)
            if achievement_level:
                validated_data['achievement_level'] = achievement_level
            else:
                raise serializers.ValidationError(
                    f'Procentai {percentage}% neatitinka jokio pasiekimų lygio (40-100%)'
                )
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """
        Atnaujinamas esamas vertinimas su automatinio pasiekimų lygio perskaičiavimu
        CHANGE: Automatinis pasiekimų lygio atnaujinimas
        """
        percentage = validated_data.get('percentage', instance.percentage)
        
        # Jei keičiasi procentai, perskaičiuojame pasiekimų lygį
        if percentage != instance.percentage:
            achievement_level = AchievementLevel.get_level_by_percentage(percentage)
            if achievement_level:
                validated_data['achievement_level'] = achievement_level
            else:
                raise serializers.ValidationError(
                    f'Procentai {percentage}% neatitinka jokio pasiekimų lygio'
                )
        
        return super().update(instance, validated_data)


class GradeListSerializer(serializers.ModelSerializer):
    """
    Mokinių vertinimų sąrašo serializer (optimizuotas)
    CHANGE: Optimizuotas serializer sąrašo rodymui
    """
    achievement_level_code = serializers.CharField(source='achievement_level.code', read_only=True)
    achievement_level_name = serializers.CharField(source='achievement_level.name', read_only=True)
    achievement_level_color = serializers.CharField(source='achievement_level.color', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = Grade
        fields = [
            'id', 'student_name', 'lesson_title', 'achievement_level_code',
            'achievement_level_name', 'achievement_level_color', 'percentage',
            'created_at'
        ]


class StudentGradeSummarySerializer(serializers.Serializer):
    """
    Mokinio vertinimų suvestinės serializer
    CHANGE: Naujas serializer statistikos rodymui
    """
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    total_grades = serializers.IntegerField()
    average_percentage = serializers.FloatField()
    achievement_levels = serializers.DictField()
    recent_grades = GradeListSerializer(many=True)


class LessonGradeSummarySerializer(serializers.Serializer):
    """
    Pamokos vertinimų suvestinės serializer
    CHANGE: Naujas serializer pamokos statistikos rodymui
    """
    lesson_id = serializers.IntegerField()
    lesson_title = serializers.CharField()
    total_students = serializers.IntegerField()
    graded_students = serializers.IntegerField()
    average_percentage = serializers.FloatField()
    achievement_levels = serializers.DictField()
    grades = GradeListSerializer(many=True) 