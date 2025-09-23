# /backend/curriculum/permissions.py
# SEC-017: Custom permission classes for curriculum API endpoints
# PURPOSE: Replace vulnerable X-Current-Role header with secure server-side role validation
# UPDATES: Created for SEC-017 security fix

from rest_framework import permissions
from rest_framework.permissions import BasePermission
from django.core.exceptions import PermissionDenied
import logging

logger = logging.getLogger(__name__)


class RoleBasedPermission(BasePermission):
    """
    SEC-017: Base permission class that validates roles from JWT tokens and database
    Replaces vulnerable X-Current-Role header with secure server-side validation
    """
    
    # Define which roles can access this permission
    allowed_roles = []
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user has permission based on validated role
        """
        # User must be authenticated
        if not request.user.is_authenticated:
            return False
        
        # Get validated role from middleware (already validated server-side)
        current_role = getattr(request, 'current_role', None)
        
        if not current_role:
            logger.warning(f"No validated role found for user {request.user.id}")
            return False
        
        # Check if role is allowed
        if current_role not in self.allowed_roles:
            logger.warning(f"Role {current_role} not allowed for user {request.user.id}")
            return False
        
        return True


class ManagerOnlyPermission(RoleBasedPermission):
    """
    SEC-017: Permission class for manager-only endpoints
    """
    allowed_roles = ['manager', 'admin']


class MentorOrManagerPermission(RoleBasedPermission):
    """
    SEC-017: Permission class for mentor and manager endpoints
    """
    allowed_roles = ['mentor', 'manager', 'admin']


class CuratorOrManagerPermission(RoleBasedPermission):
    """
    SEC-017: Permission class for curator and manager endpoints
    """
    allowed_roles = ['curator', 'manager', 'admin']


class AllAuthenticatedPermission(RoleBasedPermission):
    """
    SEC-017: Permission class for all authenticated users
    """
    allowed_roles = ['student', 'parent', 'mentor', 'curator', 'manager', 'admin']


class StudentOrParentPermission(RoleBasedPermission):
    """
    SEC-017: Permission class for student and parent endpoints
    """
    allowed_roles = ['student', 'parent']


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
            return False
        
        # Students can only read
        if current_role == 'student':
            return request.method in permissions.SAFE_METHODS
        
        # Other roles have full access
        return current_role in ['mentor', 'curator', 'manager', 'admin']


class LessonPermission(BasePermission):
    """
    SEC-017: Custom permission class for lesson endpoints with complex role logic
    """
    
    def has_permission(self, request, view):
        """
        SEC-017: Check if user has permission to access lesson endpoints
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        
        if not current_role:
            return False
        
        # All authenticated users can read lessons
        if request.method in permissions.SAFE_METHODS:
            return current_role in ['student', 'parent', 'mentor', 'curator', 'manager', 'admin']
        
        # Only mentors, curators, and managers can create/update/delete
        return current_role in ['mentor', 'curator', 'manager', 'admin']
    
    def has_object_permission(self, request, view, obj):
        """
        SEC-017: Check if user has permission to access specific lesson object
        """
        if not request.user.is_authenticated:
            return False
        
        current_role = getattr(request, 'current_role', None)
        
        if not current_role:
            return False
        
        # Managers and admins can access all lessons
        if current_role in ['manager', 'admin']:
            return True
        
        # Mentors can access their own lessons
        if current_role == 'mentor':
            return obj.mentor == request.user
        
        # Curators can access lessons for their students
        if current_role == 'curator':
            from crm.models import StudentCurator
            curated_students = StudentCurator.objects.filter(curator=request.user).values_list('student', flat=True)
            return obj.levels.filter(students__in=curated_students).exists()
        
        # Students can access lessons they're enrolled in
        if current_role == 'student':
            return obj.levels.filter(students=request.user).exists()
        
        # Parents can access lessons for their children
        if current_role == 'parent':
            from crm.models import StudentParent
            children = StudentParent.objects.filter(parent=request.user).values_list('student', flat=True)
            return obj.levels.filter(students__in=children).exists()
        
        return False
