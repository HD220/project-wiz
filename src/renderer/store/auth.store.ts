import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthenticatedUser, LoginCredentials } from "@/main/features/auth/auth.types";

interface AuthState {
  // State
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;

  // Quick login for testing
  quickLogin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with credentials
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.auth.login(credentials);

          if (response.success && response.data) {
            set({
              user: response.data as AuthenticatedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Login failed");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      // Quick login for testing (creates default user if needed)
      quickLogin: async () => {
        set({ isLoading: true, error: null });

        try {
          // Try to register demo user first (will fail if already exists, which is fine)
          try {
            await window.api.auth.register({
              name: "Demo User",
              username: "demo",
              password: "demo123",
            });
          } catch {
            // User might already exist, continue to login
          }

          // Now login with demo credentials
          const response = await window.api.auth.login({
            username: "demo",
            password: "demo123",
          });

          if (response.success && response.data) {
            set({
              user: response.data as AuthenticatedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Quick login failed");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Quick login failed",
          });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.auth.logout();

          if (response.success) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Logout failed");
          }
        } catch (error) {
          // Even if logout fails, clear local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : "Logout failed",
          });
        }
      },

      // Get current user (check if still authenticated)
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.auth.getCurrentUser();

          if (response.success && response.data) {
            set({
              user: response.data as AuthenticatedUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Not authenticated
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to get current user",
          });
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      // Only persist user and auth status, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
