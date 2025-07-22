// ===========================
// USE AUTH WITH QUERIES HOOK
// ===========================
// Hook that manages authentication state and query invalidation

import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/renderer/store/auth.store";

/**
 * Enhanced auth hook that properly manages TanStack Query cache
 * when authentication state changes
 */
export function useAuthWithQueries() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  // Enhanced logout that clears all queries
  const logout = async () => {
    await authStore.logout();
    
    // Clear all queries when user logs out
    queryClient.clear();
  };

  // Enhanced getCurrentUser that invalidates queries on auth failure
  const getCurrentUser = async () => {
    const wasAuthenticated = authStore.isAuthenticated;
    
    await authStore.getCurrentUser();
    
    const isNowAuthenticated = authStore.isAuthenticated;
    
    // If authentication status changed, clear queries
    if (wasAuthenticated && !isNowAuthenticated) {
      queryClient.clear();
    }
  };

  return {
    ...authStore,
    logout,
    getCurrentUser,
  };
}