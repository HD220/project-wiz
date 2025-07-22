import { create } from "zustand";

import type { AuthenticatedUser } from "@/main/features/auth/auth.types";
import type { Theme } from "@/main/features/user/user.types";

import { userApi } from "./user.api";

interface UserState {
  // State
  theme: Theme | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getTheme: (userId: string) => Promise<void>;
  updateTheme: (userId: string, theme: Theme) => Promise<void>;
  clearError: () => void;

  // Helper to sync with auth store
  setThemeFromUser: (user: AuthenticatedUser | null) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Initial state
  theme: null,
  isLoading: false,
  error: null,

  // Get user theme
  getTheme: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await userApi.getTheme(userId);

      if (response.success && response.data) {
        set({
          theme: response.data as Theme,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || "Failed to get theme");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get theme",
      });
      throw error;
    }
  },

  // Update user theme
  updateTheme: async (userId: string, theme: Theme) => {
    set({ isLoading: true, error: null });

    try {
      const response = await userApi.updateTheme(userId, theme);

      if (response.success) {
        set({
          theme,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || "Failed to update theme");
      }
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update theme",
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Helper to sync theme from authenticated user
  setThemeFromUser: async (user: AuthenticatedUser | null) => {
    if (!user) {
      set({ theme: null });
      return;
    }

    // Get theme from backend if not already loaded
    const { theme } = get();
    if (!theme) {
      try {
        await get().getTheme(user.id);
      } catch (error) {
        // If theme fetch fails, default to system
        set({ theme: "system", error: null });
      }
    }
  },
}));
