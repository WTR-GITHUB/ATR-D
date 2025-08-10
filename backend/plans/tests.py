from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import date, timedelta

from .models import LessonSequence, LessonSequenceItem, IMUPlan
from curriculum.models import Subject, Level, Lesson
from schedule.models import Period, Classroom, GlobalSchedule

User = get_user_model()


class PlansModelsTestCase(TestCase):
    """
    Plans app modelių testai
    """
    
    def setUp(self):
        """Testo duomenų paruošimas"""
        # Sukuriame test duomenis
        self.subject = Subject.objects.create(name="Matematika")
        self.level = Level.objects.create(name="5 klasė")
        
        self.mentor = User.objects.create_user(
            email="mentor@test.com",
            password="testpass123",
            first_name="Jonas",
            last_name="Mentorius",
            roles=['mentor']
        )
        
        self.student = User.objects.create_user(
            email="student@test.com",
            password="testpass123",
            first_name="Petras",
            last_name="Studentas",
            roles=['student']
        )
        
        self.lesson = Lesson.objects.create(
            title="Skaičių sistema",
            subject=self.subject,
            mentor=self.mentor
        )
        
        self.period = Period.objects.create(
            starttime="08:00",
            duration=45
        )
        
        self.classroom = Classroom.objects.create(name="5A")
        
        self.global_schedule = GlobalSchedule.objects.create(
            date=date.today(),
            period=self.period,
            classroom=self.classroom,
            subject=self.subject,
            level=self.level,
            user=self.mentor
        )
    
    def test_lesson_sequence_creation(self):
        """Testuoja pamokų sekos kūrimą"""
        sequence = LessonSequence.objects.create(
            name="5A matematikos programa",
            subject=self.subject,
            level=self.level,
            created_by=self.mentor
        )
        
        self.assertEqual(sequence.name, "5A matematikos programa")
        self.assertEqual(sequence.subject, self.subject)
        self.assertEqual(sequence.level, self.level)
        self.assertEqual(sequence.created_by, self.mentor)
        self.assertTrue(sequence.is_active)
    
    def test_lesson_sequence_item_creation(self):
        """Testuoja sekos elemento kūrimą"""
        sequence = LessonSequence.objects.create(
            name="Test seka",
            subject=self.subject,
            level=self.level
        )
        
        item = LessonSequenceItem.objects.create(
            sequence=sequence,
            lesson=self.lesson,
            position=1
        )
        
        self.assertEqual(item.sequence, sequence)
        self.assertEqual(item.lesson, self.lesson)
        self.assertEqual(item.position, 1)
    
    def test_imu_plan_creation(self):
        """Testuoja individualaus plano kūrimą"""
        plan = IMUPlan.objects.create(
            student=self.student,
            global_schedule=self.global_schedule,
            lesson=self.lesson,
            status='planned'
        )
        
        self.assertEqual(plan.student, self.student)
        self.assertEqual(plan.global_schedule, self.global_schedule)
        self.assertEqual(plan.lesson, self.lesson)
        self.assertEqual(plan.status, 'planned')
        self.assertIsNone(plan.started_at)
        self.assertIsNone(plan.completed_at)
    
    def test_imu_plan_status_update(self):
        """Testuoja plano statuso atnaujinimą"""
        plan = IMUPlan.objects.create(
            student=self.student,
            global_schedule=self.global_schedule,
            lesson=self.lesson,
            status='planned'
        )
        
        # Atnaujiname statusą į 'in_progress'
        plan.status = 'in_progress'
        plan.save()
        
        self.assertIsNotNone(plan.started_at)
        self.assertEqual(plan.status, 'in_progress')
    
    def test_lesson_sequence_str_representation(self):
        """Testuoja sekos string atvaizdavimą"""
        sequence = LessonSequence.objects.create(
            name="Test seka",
            subject=self.subject,
            level=self.level
        )
        
        expected_str = f"Test seka ({self.subject} / {self.level})"
        self.assertEqual(str(sequence), expected_str)
    
    def test_lesson_sequence_item_str_representation(self):
        """Testuoja sekos elemento string atvaizdavimą"""
        sequence = LessonSequence.objects.create(
            name="Test seka",
            subject=self.subject,
            level=self.level
        )
        
        item = LessonSequenceItem.objects.create(
            sequence=sequence,
            lesson=self.lesson,
            position=1
        )
        
        expected_str = f"Test seka → 1: {self.lesson}"
        self.assertEqual(str(item), expected_str)
    
    def test_imu_plan_str_representation(self):
        """Testuoja plano string atvaizdavimą"""
        plan = IMUPlan.objects.create(
            student=self.student,
            global_schedule=self.global_schedule,
            lesson=self.lesson,
            status='planned'
        )
        
        expected_str = f"{self.student} - {self.global_schedule} - {self.lesson} (Suplanuota)"
        self.assertEqual(str(plan), expected_str)
