import logging
from rest_framework import permissions
from rest_framework.permissions import BasePermission

logger = logging.getLogger(__name__)


class AllAuthenticatedPermission(BasePermission):
    """
    SEC-017: Permission class for all authenticated users
    Allows all authenticated users regardless of role
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user is authenticated
        """
        return request.user.is_authenticated


class MentorOrManagerPermission(BasePermission):
    """
    SEC-017: Permission class for mentor and manager endpoints
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user has mentor or manager role
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        return current_role in ['mentor', 'manager']


class ManagerOnlyPermission(BasePermission):
    """
    SEC-017: Permission class for manager-only endpoints
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user has manager role
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        return current_role == 'manager'


class CuratorOrManagerPermission(BasePermission):
    """
    SEC-017: Permission class for curator and manager endpoints
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user has curator or manager role
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        return current_role in ['curator', 'manager']


class ReadOnlyForStudentsPermission(BasePermission):
    """
    SEC-017: Permission class that allows read-only access for students
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check permissions based on HTTP method and user role
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        if not current_role:
            return False
        
        # Students can only read
        if current_role == 'student':
            return request.method in permissions.SAFE_METHODS
        
        # Other roles have full access
        return current_role in ['mentor', 'curator', 'manager']


class LessonPermission(BasePermission):
    """
    SEC-017: Custom permission class for lesson endpoints with complex role logic
    """
    
    def has_permission(self, request, _view):
        """
        SEC-017: Check if user has permission to access lesson endpoints
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        
        # If no current_role, try to get default role from user
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        # If still no role, deny access
        if not current_role:
            return False
        
        # All authenticated users can read lessons
        if request.method in permissions.SAFE_METHODS:
            return current_role in ['student', 'parent', 'mentor', 'curator', 'manager']
        
        # Only mentors, curators, and managers can create/update/delete
        return current_role in ['mentor', 'curator', 'manager']
    
    def has_object_permission(self, request, _view, obj):
        """
        SEC-017: Check if user has permission to access specific lesson object
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        
        # If no current_role, try to get default role from user
        if not current_role:
            current_role = getattr(request.user, 'default_role', None)
        
        # If still no role, deny access
        if not current_role:
            return False
        
        # Managers can access all lessons
        if current_role == 'manager':
            return True
        
        # Mentors can access their own lessons
        if current_role == 'mentor':
            return obj.mentor == request.user
        
        # Curators can access lessons for their students
        if current_role == 'curator':
            from crm.models import StudentCurator
            try:
                curated_students = StudentCurator.objects.filter(curator=request.user).values_list('student', flat=True)
                return obj.levels.filter(students__in=curated_students).exists()
            except Exception:
                return False
        
        # Students can access lessons they're enrolled in
        if current_role == 'student':
            try:
                return obj.levels.filter(students=request.user).exists()
            except Exception:
                return False
        
        # Parents can access lessons for their children
        if current_role == 'parent':
            from crm.models import StudentParent
            try:
                children = StudentParent.objects.filter(parent=request.user).values_list('student', flat=True)
                return obj.levels.filter(students__in=children).exists()
            except Exception:
                return False
        
        return False