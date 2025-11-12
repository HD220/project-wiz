import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/tauri-api';
import type { User, RegisterInput, LoginInput } from '@/lib/types';

// ============================================================================
// Auth Store State
// ============================================================================

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthActions = {
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
};

type AuthStore = AuthState & AuthActions;

// ============================================================================
// Auth Store Implementation
// ============================================================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      register: async (input: RegisterInput) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await api.auth.register(input);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (input: LoginInput) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token } = await api.auth.login(input);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await api.auth.logout(token);
          } catch (error) {
            console.error('Logout error:', error);
          }
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await api.auth.getCurrentUser(token);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token invalid or expired
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
