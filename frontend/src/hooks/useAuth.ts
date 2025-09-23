// /frontend/src/hooks/useAuth.ts
// SEC-001: Refactored for cookie-based authentication
'use client';

import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials, AuthResponse, UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  // SEC-001: Remove token and refreshToken from state - handled by cookies
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  currentRole: string | null; // Dabartinė aktyvi rolė
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  // SEC-001: Remove refreshAuthToken - handled automatically by cookies
  getCurrentUserId: () => number | null;
  setCurrentRole: (role: string) => void; // Nustatyti dabartinę rolę
  getCurrentRole: () => string | null; // Gauti dabartinę rolę
}

type AuthStore = AuthState & AuthActions;

export const useAuth = create<AuthStore>()(
  (set, get) => ({
      // SEC-001: State updated for cookie-based authentication
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      currentRole: null, // Dabartinė aktyvi rolė

      // SEC-001: Actions updated for cookie-based authentication
      login: async (credentials: LoginCredentials) => {
        // RESET visą state prieš login
        set({ 
          user: null,
          isAuthenticated: false,
          isLoading: true, 
          error: null 
        });
        
        try {
          // SEC-001: Clear old data before login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('current_role');
            localStorage.removeItem('auth-storage');
            sessionStorage.removeItem('auth-storage');
          }
          
          // SEC-001: Login with cookie-based authentication
          const response = await authAPI.login(credentials);
          // SEC-001: Tokens are now handled by cookies automatically
          
          // SEC-001: Fetch user data from backend
          try {
            const userResponse = await authAPI.me();
            const user = userResponse.data;
            
            // SEC-001: Set currentRole based on default_role
            const initialRole = user.default_role || user.roles?.[0] || null;
            
            // SEC-001: Save currentRole to localStorage for API requests
            if (typeof window !== 'undefined' && initialRole) {
              localStorage.setItem('current_role', initialRole);
            }
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              currentRole: initialRole, // Set current role
            });
          } catch {
            // SEC-001: Improved error handling for user data fetching
            // If fetching user data fails, use basic info from login
            const user = {
              id: 0,
              email: credentials.email,
              first_name: '',
              last_name: '',
              roles: ['student'] as UserRole[],
              is_active: true,
              date_joined: new Date().toISOString(),
            };
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          // CHANGE: Type-safe error handling for login errors
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Login failed'
            : 'Login failed';
          
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // SEC-001: Logout updated for cookie-based authentication
      logout: async () => {
        try {
          // SEC-001: Call logout endpoint to clear cookies on server
          await authAPI.logout();
        } catch {
          // Ignore logout API errors - cookies will be cleared anyway
        }
        
        if (typeof window !== 'undefined') {
          // SEC-001: Clear client-side data
          localStorage.removeItem('current_role');
          localStorage.removeItem('auth-storage');
          sessionStorage.removeItem('auth-storage');
        }
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          currentRole: null, // Clear current role
        });
        
        // Reload page to root after logout
        window.location.href = '/';
      },

      setUser: (user: User) => {
        set({ user });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearError: () => {
        set({ error: null });
      },

      // CHANGE: Pridėta pagalbinė funkcija dabartinio vartotojo ID gavimui
      getCurrentUserId: () => {
        const user = get().user;
        return user?.id || null;
      },

      // CHANGE: Pridėtos funkcijos dabartinės rolės valdymui
      setCurrentRole: (role: string) => {
        set({ currentRole: role });
        // CHANGE: Išsaugoti currentRole į localStorage API užklausoms
        if (typeof window !== 'undefined') {
          localStorage.setItem('current_role', role);
        }
      },

      getCurrentRole: () => {
        const { currentRole, user } = get();
        // Grąžina dabartinę rolę arba default_role arba pirmąją rolę
        return currentRole || user?.default_role || user?.roles?.[0] || null;
      },

      // SEC-001: Token refresh is now handled automatically by cookies

          // SEC-001: Initialize authentication with cookie-based approach
          initializeAuth: async () => {
            // SEC-001: Handle server-side rendering
            if (typeof window === 'undefined') {
              set({ isLoading: false });
              return;
            }

            // SEC-001: Clear any old localStorage data first to prevent conflicts
            localStorage.removeItem('current_role');
            localStorage.removeItem('auth-storage');
            sessionStorage.removeItem('auth-storage');

            // SEC-001: Set initial state as not authenticated
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              currentRole: null,
            });

            // SEC-001: Don't try to fetch user data on initialization to prevent redirect loops
            // User will be authenticated when they actually log in
          },
    })
); 