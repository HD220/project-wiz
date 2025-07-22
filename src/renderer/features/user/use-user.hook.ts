// User hook - Custom React hook for user operations

import { useEffect } from "react";

import { useAuth } from "@/renderer/contexts/auth.context";

import { useUserStore } from "./user.store";

export function useUser() {
  const auth = useAuth();
  const user = useUserStore();

  // Sync theme when user changes
  useEffect(() => {
    if (auth.user && auth.isAuthenticated) {
      user.setThemeFromUser(auth.user);
    } else {
      user.setThemeFromUser(null);
    }
  }, [auth.user, auth.isAuthenticated]);

  return {
    // User data from auth store
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,

    // Theme data from user store
    theme: user.theme,

    // Loading states
    isLoading: auth.isLoading || user.isLoading,

    // Error states
    authError: auth.error,
    userError: user.error,

    // Actions
    updateTheme: user.updateTheme,
    clearAuthError: auth.clearError,
    clearUserError: user.clearError,

    // Helper to clear all errors
    clearAllErrors: () => {
      auth.clearError();
      user.clearError();
    },
  };
}
