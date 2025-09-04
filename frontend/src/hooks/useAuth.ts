// /frontend/src/hooks/useAuth.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials, AuthResponse, UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
  getCurrentUserId: () => number | null;
}

type AuthStore = AuthState & AuthActions;

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // CHANGE: Išvalyti senus duomenis PRISIJUNGIMO pradžioje
          // Tai užtikrina, kad naujas vartotojas negaus ankstesnio vartotojo duomenų
          if (typeof window !== 'undefined') {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 CLEARED ALL STORAGE BEFORE LOGIN');
          }
          
          const response = await authAPI.login(credentials);
          const { access, refresh }: AuthResponse = response.data;
          
          // Store tokens in localStorage (only on client side)
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
          }
          
          // Fetch user data from backend
          try {
            const userResponse = await authAPI.me();
            const user = userResponse.data;
            
            // CHANGE: Pridėti console.log rolių informacijai patikrinti useAuth hook'e
            console.log('🔍 RAW API RESPONSE IN useAuth:', userResponse);
            console.log('🔍 USER DATA IN useAuth:', user);
            console.log('👤 USER ROLES IN useAuth:', user.roles);
            console.log('🎯 ROLES TYPE IN useAuth:', typeof user.roles);
            console.log('📊 ROLES LENGTH IN useAuth:', user.roles?.length);
            console.log('🔢 ROLES ARRAY IN useAuth:', Array.isArray(user.roles));
            
            set({
              user,
              token: access,
              refreshToken: refresh,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (userError: unknown) {
            // CHANGE: Improved error handling for user data fetching
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
              token: access,
              refreshToken: refresh,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error: unknown) {
          // CHANGE: Type-safe error handling for login errors
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error as any).response?.data?.detail || 'Login failed'
            : 'Login failed';
          
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          // CHANGE: Išvalyti VISUS duomenis iš localStorage ir sessionStorage
          // Tai užtikrina, kad kitas vartotojas negaus ankstesnio vartotojo duomenų
          localStorage.clear();
          sessionStorage.clear();
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        // Perkrauti puslapį į root po logout
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

      // CHANGE: Added new method to handle token refresh with better error handling
      refreshAuthToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) {
            return false;
          }

          const response = await authAPI.refresh(refreshToken);
          const { access } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access);
          }
          
          set({ token: access });
          return true;
        } catch (error) {
          // Refresh failed, clear auth state
          get().logout();
          return false;
        }
      },

      // Initialize user data from stored token
      initializeAuth: async () => {
        // CHANGE: Improved initialization to handle server-side rendering better
        if (typeof window === 'undefined') {
          // Server-side: set loading to false without trying to access localStorage
          set({ isLoading: false });
          return;
        }

        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const userResponse = await authAPI.me();
            const user = userResponse.data;
            
            set({
              user,
              token,
              refreshToken: localStorage.getItem('refresh_token'),
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (error) {
            // CHANGE: Better error handling - try to refresh token first
            const refreshSuccess = await get().refreshAuthToken();
            if (!refreshSuccess) {
              // Token is invalid, clear storage
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 