# backend/grades/views.py

# Grades aplikacijos views - API endpoint'ų valdymas
# CHANGE: Sukurtas naujas views.py failas su AchievementLevel ir Grade views

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.shortcuts import get_object_or_404
from .models import AchievementLevel, Grade, GradeCalculation
from .serializers import (
    AchievementLevelSerializer, GradeSerializer, GradeListSerializer,
    GradeCalculationSerializer, StudentGradeSummarySerializer,
    LessonGradeSummarySerializer
)


class AchievementLevelViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Pasiekimų lygių viewset - tik skaitymas
    CHANGE: Read-only viewset pasiekimų lygiams
    """
    queryset = AchievementLevel.objects.all()
    serializer_class = AchievementLevelSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def by_percentage(self, request):
        """
        Grąžina pasiekimų lygį pagal procentus
        GET /api/grades/achievement-levels/by_percentage/?percentage=75
        """
        percentage = request.query_params.get('percentage')
        if not percentage:
            return Response(
                {'error': 'Nurodykite procentus'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            percentage = int(percentage)
            level = AchievementLevel.get_level_by_percentage(percentage)
            
            if level:
                serializer = self.get_serializer(level)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': f'Procentai {percentage}% neatitinka jokio pasiekimų lygio'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except ValueError:
            return Response(
                {'error': 'Netinkami procentai'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class GradeViewSet(viewsets.ModelViewSet):
    """
    Mokinių vertinimų viewset su automatinio skaičiavimo funkcionalumu
    CHANGE: Pilnas CRUD funkcionalumas su automatinio skaičiavimo
    """
    queryset = Grade.objects.select_related(
        'student', 'lesson', 'mentor', 'achievement_level', 'imu_plan'
    )
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtruojame vertinimus pagal parametrus ir dabartinę rolę
        CHANGE: Pridėtas filtravimas ir X-Current-Role header palaikymas
        """
        # SEC-011: Naudojame server-side role validation vietoj manipuliuojamo header dabartinės rolės nustatymui
        current_role = getattr(self.request, 'current_role', None)
        if not current_role:
            current_role = getattr(self.request.user, 'default_role', None)
        
        queryset = super().get_queryset()
        
        # Role-based filtravimas
        if current_role == 'student':
            # Studentas mato tik savo vertinimus
            queryset = queryset.filter(student=self.request.user)
        elif current_role == 'parent':
            # Tėvas mato savo vaikų vertinimus
            from crm.models import StudentParent
            children = StudentParent.objects.filter(parent=self.request.user).values_list('student', flat=True)
            queryset = queryset.filter(student__in=children)
        elif current_role == 'mentor':
            # Mentorius mato tik savo sukurtų vertinimus
            queryset = queryset.filter(mentor=self.request.user)
        elif current_role == 'curator':
            # Kuratorius mato savo kuruojamų studentų vertinimus
            from crm.models import StudentCurator
            curated_students = StudentCurator.objects.filter(curator=self.request.user).values_list('student', flat=True)
            queryset = queryset.filter(student__in=curated_students)
        elif current_role != 'manager':
            # Jei ne manager ir ne kita žinoma rolė, grąžinti tuščią queryset
            queryset = queryset.none()
        
        # Filtravimas pagal mokinį
        student_id = self.request.query_params.get('student')
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        
        # Filtravimas pagal pamoką
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        
        # Filtravimas pagal mentorių
        mentor_id = self.request.query_params.get('mentor')
        if mentor_id:
            queryset = queryset.filter(mentor_id=mentor_id)
        
        # CHANGE: Pridėtas IMU plan filtravimas
        imu_plan_id = self.request.query_params.get('imu_plan')
        if imu_plan_id:
            queryset = queryset.filter(imu_plan_id=imu_plan_id)
        
        # Filtravimas pagal pasiekimų lygį
        achievement_level = self.request.query_params.get('achievement_level')
        if achievement_level:
            queryset = queryset.filter(achievement_level__code=achievement_level)
        
        return queryset
    
    def get_serializer_class(self):
        """
        Pasirenkame serializer pagal veiksmą
        CHANGE: Optimizuotas serializer sąrašo rodymui, bet pilnas serializer kai reikia detalių
        """
        # CHANGE: Jei užklausa turi specifius parametrus (ieškoma konkretaus vertinimo), naudojame pilną serializer
        if self.action == 'list' and not any([
            self.request.query_params.get('student'),
            self.request.query_params.get('lesson'), 
            self.request.query_params.get('imu_plan')
        ]):
            return GradeListSerializer
        return GradeSerializer
    
    @action(detail=False, methods=['post'])
    def calculate_level(self, request):
        """
        Apskaičiuoja pasiekimų lygį pagal procentus
        POST /api/grades/grades/calculate_level/
        """
        percentage = request.data.get('percentage')
        if not percentage:
            return Response(
                {'error': 'Nurodykite procentus'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            percentage = int(percentage)
            level = AchievementLevel.get_level_by_percentage(percentage)
            
            if level:
                # Įrašome skaičiavimą istorijoje
                calculation = GradeCalculation.objects.create(
                    percentage=percentage,
                    calculated_level=level
                )
                
                serializer = GradeCalculationSerializer(calculation)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': f'Procentai {percentage}% neatitinka jokio pasiekimų lygio'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except ValueError:
            return Response(
                {'error': 'Netinkami procentai'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def student_summary(self, request):
        """
        Grąžina mokinio vertinimų suvestinę
        GET /api/grades/grades/student_summary/?student_id=123
        """
        student_id = request.query_params.get('student_id')
        if not student_id:
            return Response(
                {'error': 'Nurodykite mokinio ID'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            student_grades = Grade.objects.filter(student_id=student_id)
            
            if not student_grades.exists():
                return Response(
                    {'error': 'Mokinys neturi vertinimų'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Skaičiuojame statistiką
            total_grades = student_grades.count()
            average_percentage = student_grades.aggregate(avg=Avg('percentage'))['avg'] or 0
            
            # Grupuojame pagal pasiekimų lygius
            achievement_levels = {}
            for grade in student_grades:
                level_code = grade.achievement_level.code
                if level_code not in achievement_levels:
                    achievement_levels[level_code] = 0
                achievement_levels[level_code] += 1
            
            # Paskutiniai vertinimai
            recent_grades = student_grades.order_by('-created_at')[:5]
            
            summary_data = {
                'student_id': int(student_id),
                'student_name': student_grades.first().student.get_full_name(),
                'total_grades': total_grades,
                'average_percentage': round(average_percentage, 2),
                'achievement_levels': achievement_levels,
                'recent_grades': GradeListSerializer(recent_grades, many=True).data
            }
            
            serializer = StudentGradeSummarySerializer(summary_data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Klaida skaičiuojant suvestinę: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def lesson_summary(self, request):
        """
        Grąžina pamokos vertinimų suvestinę
        GET /api/grades/grades/lesson_summary/?lesson_id=456
        """
        lesson_id = request.query_params.get('lesson_id')
        if not lesson_id:
            return Response(
                {'error': 'Nurodykite pamokos ID'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lesson_grades = Grade.objects.filter(lesson_id=lesson_id)
            
            if not lesson_grades.exists():
                return Response(
                    {'error': 'Pamoka neturi vertinimų'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Skaičiuojame statistiką
            total_students = lesson_grades.values('student').distinct().count()
            graded_students = lesson_grades.count()
            average_percentage = lesson_grades.aggregate(avg=Avg('percentage'))['avg'] or 0
            
            # Grupuojame pagal pasiekimų lygius
            achievement_levels = {}
            for grade in lesson_grades:
                level_code = grade.achievement_level.code
                if level_code not in achievement_levels:
                    achievement_levels[level_code] = 0
                achievement_levels[level_code] += 1
            
            summary_data = {
                'lesson_id': int(lesson_id),
                'lesson_title': lesson_grades.first().lesson.title,
                'total_students': total_students,
                'graded_students': graded_students,
                'average_percentage': round(average_percentage, 2),
                'achievement_levels': achievement_levels,
                'grades': GradeListSerializer(lesson_grades, many=True).data
            }
            
            serializer = LessonGradeSummarySerializer(summary_data)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': f'Klaida skaičiuojant suvestinę: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def recalculate_all(self, request):
        """
        Perskaičiuoja visus vertinimus su naujais pasiekimų lygiais
        POST /api/grades/grades/recalculate_all/
        CHANGE: Masinis perskaičiavimas
        """
        try:
            updated_count = 0
            grades = Grade.objects.all()
            
            for grade in grades:
                new_level = AchievementLevel.get_level_by_percentage(grade.percentage)
                if new_level and new_level != grade.achievement_level:
                    grade.achievement_level = new_level
                    grade.save(update_fields=['achievement_level'])
                    updated_count += 1
            
            return Response({
                'message': f'Sėkmingai atnaujinta {updated_count} vertinimų',
                'updated_count': updated_count
            })
            
        except Exception as e:
            return Response(
                {'error': f'Klaida perskaičiuojant: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def get_or_create(self, request):
        """
        Gauna esamą vertinimą arba sukuria naują
        POST /api/grades/grades/get_or_create/
        CHANGE: Pridėtas get_or_create funkcionalumas esamų įrašų atnaujinimui
        """
        try:
            student_id = request.data.get('student')
            lesson_id = request.data.get('lesson')
            mentor_id = request.data.get('mentor')
            percentage = request.data.get('percentage')
            imu_plan_id = request.data.get('imu_plan')
            notes = request.data.get('notes', '')
            
            if not all([student_id, lesson_id, mentor_id, percentage]):
                return Response(
                    {'error': 'Trūksta privalomų laukų: student, lesson, mentor, percentage'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # CHANGE: Ieškome esamą įrašą su tais pačiais parametrais
            existing_grade = None
            if imu_plan_id:
                # CHANGE: Jei yra IMU plan, ieškome pagal jį
                existing_grade = Grade.objects.filter(
                    student_id=student_id,
                    lesson_id=lesson_id,
                    imu_plan_id=imu_plan_id
                ).first()
            else:
                # CHANGE: Jei nėra IMU plan, ieškome pagal student ir lesson
                existing_grade = Grade.objects.filter(
                    student_id=student_id,
                    lesson_id=lesson_id,
                    imu_plan__isnull=True
                ).first()
            
            if existing_grade:
                # CHANGE: Atnaujiname esamą įrašą

                existing_grade.percentage = percentage
                existing_grade.mentor_id = mentor_id
                existing_grade.notes = notes
                existing_grade.save()
                
                serializer = self.get_serializer(existing_grade)

                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # CHANGE: Kuriamas naujas įrašas

                grade_data = {
                    'student': student_id,      # CHANGE: student_id -> student
                    'lesson': lesson_id,        # CHANGE: lesson_id -> lesson
                    'mentor': mentor_id,        # CHANGE: mentor_id -> mentor
                    'percentage': percentage,
                    'imu_plan': imu_plan_id,    # CHANGE: imu_plan_id -> imu_plan
                    'notes': notes
                }
                
                serializer = self.get_serializer(data=grade_data)
                if serializer.is_valid():
                    grade = serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
        except Exception as e:
    
            return Response(
                {'error': f'Klaida: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
