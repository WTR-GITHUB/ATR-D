// /frontend/src/hooks/useAuth.ts
// Simple authentication hook - no Context, no AuthManager
'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  roles: string[];
  default_role: string;
  current_role?: string; // Dabartinė aktyvi rolė (iš token'o)
  is_active: boolean;
  date_joined: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  currentRole: string | null;
  isRoleSwitching: boolean; // NEW: Loading state for role switching
}

/**
 * Simple useAuth hook with direct API calls
 * No complex state management - just basic auth functionality
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    currentRole: null,
    isRoleSwitching: false, // NEW: Initialize role switching state
  });

  const validateAuth = useCallback(async () => {
    try {
      // OPTIMIZATION: Skip validation if role switching is in progress
      if (authState.isRoleSwitching) {
        return;
      }

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check cookies for debugging (no console log)
      // const hasCookies = document.cookie.length > 0;
      
      // SIMPLIFIED: Only call /api/users/me/ - it will handle authentication internally
      let userResponse;
      try {
        userResponse = await fetch('/api/users/me/', {
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
      } catch (error) {
        // Network error - user not authenticated
        userResponse = { ok: false };
      }

      if (userResponse.ok && 'json' in userResponse) {
        const userData: User = await userResponse.json();
        
        // ROLE SWITCHING TOKEN LOGIC: Naudoti current_role iš backend
        let currentRole = userData.current_role || userData.default_role || userData.roles[0] || null;

        // SEC-011: No localStorage needed - role is managed server-side
        // Role information comes from JWT token via RoleValidationMiddleware

        setAuthState({
          user: userData,
          isLoading: false,
          error: null,
          currentRole,
          isRoleSwitching: false,
        });
        
      } else {
        // User data fetch failed - not authenticated
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
          currentRole: null,
          isRoleSwitching: false,
        });
        return;
      }
    } catch {
      // Authentication validation failed - user not logged in
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        currentRole: null,
        isRoleSwitching: false,
      });
    }
  }, [authState.isRoleSwitching]);

  // Validate authentication on mount
  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  // CRITICAL FIX: Listen for role changes from other components
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      const { role } = event.detail;
      setAuthState(prev => ({ ...prev, currentRole: role }));
    };

    window.addEventListener('roleChanged', handleRoleChange as EventListener);
    return () => {
      window.removeEventListener('roleChanged', handleRoleChange as EventListener);
    };
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/users/token/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      // After successful login, get user data
      await validateAuth();
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/users/logout/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch {
      // Logout API failed - continue with local logout
    }

    // Clear state regardless of API success
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
      currentRole: null,
      isRoleSwitching: false,
    });

    // Redirect to login
    window.location.href = '/auth/login';
  };

  const switchRole = useCallback(async (role: string) => {
    if (!authState.user || !authState.user.roles.includes(role)) {
      return false;
    }

    try {
      // OPTIMIZATION: Set loading state to prevent validation loops
      setAuthState(prev => ({ ...prev, isRoleSwitching: true }));

      // ROLE SWITCHING TOKEN LOGIC: Naudoti naują backend API
      const response = await fetch('/api/users/switch-role/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Role switch failed');
      }

      const data = await response.json();
      
      // ✅ COOKIE REWRITE LOGIC: Backend automatiškai perrašo cookie'us
      // Backend siunčia naujus cookie'us su Set-Cookie header'iais
      // Frontend tiesiog atnaujina state su nauja current_role
      
      // ✅ Atnaujinti frontend state su nauja current_role:
      setAuthState(prev => ({ 
        ...prev, 
        currentRole: data.current_role || role,
        isRoleSwitching: false 
      }));
      
      // ✅ Broadcast role change event:
      window.dispatchEvent(new CustomEvent('roleChanged', { 
        detail: { role: data.current_role || role, timestamp: Date.now() } 
      }));
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isRoleSwitching: false }));
      console.error('Role switch failed:', error);
      return false;
    }
  }, [authState.user]);

  const redirectToDashboard = () => {
    if (!authState.user) {
      return;
    }

    // ROLE SWITCHING TOKEN LOGIC: Naudoti current_role iš token'o
    const role = authState.currentRole || authState.user.current_role || authState.user.default_role || authState.user.roles[0];

    switch (role) {
      case 'manager':
        window.location.href = '/managers';
        break;
      case 'curator':
        window.location.href = '/curators';
        break;
      case 'mentor':
        window.location.href = '/mentors';
        break;
      case 'parent':
        window.location.href = '/parents';
        break;
      case 'student':
        window.location.href = '/students';
        break;
      default:
        window.location.href = '/';
    }
  };

  return {
    // State
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    currentRole: authState.currentRole,
    isAuthenticated: !!authState.user,
    isRoleSwitching: authState.isRoleSwitching, // NEW: Expose role switching state

    // Actions
    login,
    logout,
    switchRole,
    redirectToDashboard,
    validateAuth,

    // Utilities
    getCurrentUserId: () => authState.user?.id || null,
    getCurrentRole: () => authState.currentRole || authState.user?.default_role || null,
  };
}

export default useAuth;