import { useAuth } from "@/renderer/contexts/auth.context";
import {
  useUpdateUserTheme,
  useUserTheme,
} from "@/renderer/features/user/user.queries";

export function useUser() {
  const auth = useAuth();
  const {
    data: theme,
    isLoading: themeLoading,
    error: themeError,
  } = useUserTheme(auth.user?.id);
  const updateThemeMutation = useUpdateUserTheme();

  const updateTheme = async (theme: string) => {
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    return updateThemeMutation.mutateAsync({
      userId: auth.user.id,
      theme: theme as any,
    });
  };

  return {
    // User data from auth context
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,

    // Theme data from TanStack Query
    theme: theme || "system",

    // Loading states
    isLoading: auth.isLoading || themeLoading || updateThemeMutation.isPending,

    // Error states
    authError: auth.error,
    userError: themeError instanceof Error ? themeError.message : null,

    // Actions
    updateTheme,
    clearAuthError: auth.clearError,
    clearUserError: () => {
      // TanStack Query handles error clearing via refetch/reset
    },

    // Helper to clear all errors
    clearAllErrors: () => {
      auth.clearError();
    },
  };
}
