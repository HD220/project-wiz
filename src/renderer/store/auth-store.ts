import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../../shared/types/common';
import type { LoginInput, RegisterInput } from '../../shared/schemas/validation.schemas';

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
  listAccounts: () => Promise<User[]>;
  isFirstRun: () => Promise<boolean>;
  createDefaultAccount: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (input: LoginInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const result: AuthResponse = await window.api.auth.login(input);
          
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (input: RegisterInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const result: AuthResponse = await window.api.auth.register(input);
          
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await window.api.auth.logout();
        } catch (error) {
          // Log error but continue with logout
          console.error('Logout error:', error);
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      validateToken: async (): Promise<boolean> => {
        const { token } = get();
        
        if (!token) {
          return false;
        }
        
        try {
          const user: User = await window.api.auth.validateToken(token);
          
          set({
            user,
            isAuthenticated: true,
            error: null,
          });
          
          return true;
        } catch (error) {
          // Token is invalid, clear auth state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          return false;
        }
      },

      listAccounts: async (): Promise<User[]> => {
        try {
          return await window.api.auth.listAccounts();
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to list accounts',
          });
          throw error;
        }
      },

      isFirstRun: async (): Promise<boolean> => {
        try {
          return await window.api.auth.isFirstRun();
        } catch (error) {
          console.error('Failed to check first run:', error);
          return false;
        }
      },

      createDefaultAccount: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const result: AuthResponse = await window.api.auth.createDefaultAccount();
          
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to create default account',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
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