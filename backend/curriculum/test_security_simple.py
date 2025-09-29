# /backend/curriculum/test_security_simple.py
# SEC-017: Simplified security tests for curriculum API authorization fixes
# PURPOSE: Test that SEC-017 fixes prevent privilege escalation
# UPDATES: Created for SEC-017 security validation

from django.test import TestCase, RequestFactory
from django.contrib.auth import get_user_model
from rest_framework import status
from unittest.mock import Mock

from .permissions import (
    ManagerOnlyPermission, MentorOrManagerPermission, CuratorOrManagerPermission,
    ReadOnlyForStudentsPermission, LessonPermission
)

User = get_user_model()


class PermissionClassesTestCase(TestCase):
    """
    SEC-017: Test cases for custom permission classes
    """
    
    def setUp(self):
        """Set up test data"""
        self.factory = RequestFactory()
        
        self.manager = User.objects.create_user(
            email='manager@test.com',
            password='testpass123',
            first_name='Manager',
            last_name='User',
            roles=['manager']
        )
        
        self.mentor = User.objects.create_user(
            email='mentor@test.com',
            password='testpass123',
            first_name='Mentor',
            last_name='User',
            roles=['mentor']
        )
        
        self.student = User.objects.create_user(
            email='student@test.com',
            password='testpass123',
            first_name='Student',
            last_name='User',
            roles=['student']
        )
        
        self.curator = User.objects.create_user(
            email='curator@test.com',
            password='testpass123',
            first_name='Curator',
            last_name='User',
            roles=['curator']
        )
    
    def test_manager_only_permission(self):
        """
        SEC-017: Test ManagerOnlyPermission class
        """
        permission = ManagerOnlyPermission()
        
        # Create mock request with manager role
        request = self.factory.get('/api/curriculum/subjects/')
        request.user = self.manager
        request.current_role = 'manager'
        
        self.assertTrue(permission.has_permission(request, None))
        
        # Test with student role
        request.current_role = 'student'
        self.assertFalse(permission.has_permission(request, None))
        
        # Test with mentor role
        request.current_role = 'mentor'
        self.assertFalse(permission.has_permission(request, None))
    
    def test_mentor_or_manager_permission(self):
        """
        SEC-017: Test MentorOrManagerPermission class
        """
        permission = MentorOrManagerPermission()
        
        request = self.factory.get('/api/curriculum/objectives/')
        request.user = self.manager
        
        # Test manager access
        request.current_role = 'manager'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test mentor access
        request.current_role = 'mentor'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test student access - should be denied
        request.current_role = 'student'
        self.assertFalse(permission.has_permission(request, None))
        
        # Test curator access - should be denied
        request.current_role = 'curator'
        self.assertFalse(permission.has_permission(request, None))
    
    def test_curator_or_manager_permission(self):
        """
        SEC-017: Test CuratorOrManagerPermission class
        """
        permission = CuratorOrManagerPermission()
        
        request = self.factory.get('/api/curriculum/virtues/')
        request.user = self.manager
        
        # Test manager access
        request.current_role = 'manager'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test curator access
        request.current_role = 'curator'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test mentor access - should be denied
        request.current_role = 'mentor'
        self.assertFalse(permission.has_permission(request, None))
        
        # Test student access - should be denied
        request.current_role = 'student'
        self.assertFalse(permission.has_permission(request, None))
    
    def test_read_only_for_students_permission(self):
        """
        SEC-017: Test ReadOnlyForStudentsPermission class
        """
        permission = ReadOnlyForStudentsPermission()
        
        # Test student read access
        request = self.factory.get('/api/curriculum/skills/')
        request.user = self.student
        request.current_role = 'student'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test student write access - should be denied
        request = self.factory.post('/api/curriculum/skills/')
        request.user = self.student
        request.current_role = 'student'
        self.assertFalse(permission.has_permission(request, None))
        
        # Test mentor write access - should work
        request.user = self.mentor
        request.current_role = 'mentor'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test manager write access - should work
        request.user = self.manager
        request.current_role = 'manager'
        self.assertTrue(permission.has_permission(request, None))
    
    def test_lesson_permission(self):
        """
        SEC-017: Test LessonPermission class
        """
        permission = LessonPermission()
        
        # Test student read access
        request = self.factory.get('/api/curriculum/lessons/')
        request.user = self.student
        request.current_role = 'student'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test student write access - should be denied
        request = self.factory.post('/api/curriculum/lessons/')
        request.user = self.student
        request.current_role = 'student'
        self.assertFalse(permission.has_permission(request, None))
        
        # Test mentor write access - should work
        request.user = self.mentor
        request.current_role = 'mentor'
        self.assertTrue(permission.has_permission(request, None))
        
        # Test manager write access - should work
        request.user = self.manager
        request.current_role = 'manager'
        self.assertTrue(permission.has_permission(request, None))
    
    def test_unauthenticated_access_denied(self):
        """
        SEC-017: Test that unauthenticated users are denied access
        """
        permission = ManagerOnlyPermission()
        
        request = self.factory.get('/api/curriculum/subjects/')
        request.user = Mock()
        request.user.is_authenticated = False
        request.current_role = None
        
        self.assertFalse(permission.has_permission(request, None))
    
    def test_no_role_access_denied(self):
        """
        SEC-017: Test that users without validated roles are denied access
        """
        permission = ManagerOnlyPermission()
        
        request = self.factory.get('/api/curriculum/subjects/')
        request.user = self.manager
        # is_authenticated is a property, not settable
        request.current_role = None  # No role set
        
        self.assertFalse(permission.has_permission(request, None))


class SecurityValidationTestCase(TestCase):
    """
    SEC-017: Test cases to validate security improvements
    """
    
    def test_permission_class_hierarchy(self):
        """
        SEC-017: Test that permission classes properly restrict access
        """
        # Test that each permission class only allows appropriate roles
        manager_permission = ManagerOnlyPermission()
        mentor_permission = MentorOrManagerPermission()
        curator_permission = CuratorOrManagerPermission()
        
        # Create a mock request
        factory = RequestFactory()
        request = factory.get('/test/')
        request.user = Mock()
        request.user.is_authenticated = True
        
        # Test manager permission
        request.current_role = 'manager'
        self.assertTrue(manager_permission.has_permission(request, None))
        self.assertTrue(mentor_permission.has_permission(request, None))
        self.assertTrue(curator_permission.has_permission(request, None))
        
        # Test mentor permission
        request.current_role = 'mentor'
        self.assertFalse(manager_permission.has_permission(request, None))
        self.assertTrue(mentor_permission.has_permission(request, None))
        self.assertFalse(curator_permission.has_permission(request, None))
        
        # Test curator permission
        request.current_role = 'curator'
        self.assertFalse(manager_permission.has_permission(request, None))
        self.assertFalse(mentor_permission.has_permission(request, None))
        self.assertTrue(curator_permission.has_permission(request, None))
        
        # Test student permission
        request.current_role = 'student'
        self.assertFalse(manager_permission.has_permission(request, None))
        self.assertFalse(mentor_permission.has_permission(request, None))
        self.assertFalse(curator_permission.has_permission(request, None))
    
    def test_privilege_escalation_prevention(self):
        """
        SEC-017: Test that privilege escalation is prevented
        """
        # Create a student user
        student = User.objects.create_user(
            email='student@test.com',
            password='testpass123',
            first_name='Student',
            last_name='User',
            roles=['student']
        )
        
        factory = RequestFactory()
        
        # Test that student cannot access manager-only endpoints
        manager_permission = ManagerOnlyPermission()
        request = factory.get('/api/curriculum/subjects/')
        request.user = student
        # is_authenticated is a property, not settable
        request.current_role = 'student'
        
        self.assertFalse(manager_permission.has_permission(request, None))
        
        # Test that student cannot access mentor-only endpoints
        mentor_permission = MentorOrManagerPermission()
        request = factory.get('/api/curriculum/objectives/')
        request.user = student
        request.current_role = 'student'
        
        self.assertFalse(mentor_permission.has_permission(request, None))
        
        # Test that student cannot access curator-only endpoints
        curator_permission = CuratorOrManagerPermission()
        request = factory.get('/api/curriculum/virtues/')
        request.user = student
        request.current_role = 'student'
        
        self.assertFalse(curator_permission.has_permission(request, None))
