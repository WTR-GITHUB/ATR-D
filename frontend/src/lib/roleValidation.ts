// /frontend/src/lib/roleValidation.ts

// Role validation utilities for A-DIENYNAS system
// Provides functions to validate and manage user roles and permissions
// CHANGE: Created role validation utilities to handle role-based access control

'use client';

import { User, UserRole } from '@/lib/types';

/**
 * Validates if a user has a specific role
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
};

/**
 * Validates if current role is valid for the user
 */
export const isValidCurrentRole = (user: User | null, currentRole: string | null): boolean => {
  if (!user || !user.roles || !currentRole) return false;
  return user.roles.includes(currentRole as UserRole);
};

/**
 * Gets the best available role for a user
 * Priority: currentRole -> default_role -> first role
 */
export const getBestRole = (user: User | null, currentRole: string | null): string | null => {
  if (!user || !user.roles || user.roles.length === 0) return null;
  
  // If current role is valid, use it
  if (currentRole && user.roles.includes(currentRole as UserRole)) {
    return currentRole;
  }
  
  // Use default role if available
  if (user.default_role && user.roles.includes(user.default_role)) {
    return user.default_role;
  }
  
  // Use first available role
  return user.roles[0];
};

/**
 * SEC-001: Validates role data - no longer uses localStorage
 * Role validation is now handled server-side via JWT tokens
 */
export const validateAndFixRole = (user: User | null): string | null => {
  if (!user) return null;
  
  // SEC-001: Role validation is now handled server-side
  // No need to manage roles in localStorage - server validates from JWT
  return getBestRole(user, null);
};

/**
 * Checks if user can access mentor-specific features
 */
export const canAccessMentorFeatures = (user: User | null, currentRole: string | null): boolean => {
  if (!user) return false;
  
  // Manager and curator can access mentor features
  if (currentRole === 'manager' || currentRole === 'curator') return true;
  
  // Mentor can access their own features
  if (currentRole === 'mentor' && hasRole(user, 'mentor')) return true;
  
  return false;
};

/**
 * Gets role display name in Lithuanian
 */
export const getRoleDisplayName = (role: string): string => {
  const roleNames: Record<string, string> = {
    'manager': 'Sistemos valdytojas',
    'curator': 'Kuratorius',
    'mentor': 'Mentorius',
    'parent': 'Tėvas/Globėjas',
    'student': 'Mokinys'
  };
  
  return roleNames[role] || role;
};

/**
 * Gets all available roles for a user with display names
 */
export const getAvailableRoles = (user: User | null): Array<{value: string, label: string}> => {
  if (!user || !user.roles) return [];
  
  return user.roles.map(role => ({
    value: role,
    label: getRoleDisplayName(role)
  }));
};
