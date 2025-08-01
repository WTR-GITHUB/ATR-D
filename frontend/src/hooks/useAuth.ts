'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '@/lib/api';
import { User, LoginCredentials, AuthResponse } from '@/lib/types';

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
            
            set({
              user,
              token: access,
              refreshToken: refresh,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (userError: any) {
            // If fetching user data fails, use basic info from login
            const user = {
              id: 0,
              email: credentials.email,
              first_name: '',
              last_name: '',
              role: 'student' as const,
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
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
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

      // Initialize user data from stored token
      initializeAuth: async () => {
        if (typeof window !== 'undefined') {
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
          } else {
            set({ isLoading: false });
          }
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