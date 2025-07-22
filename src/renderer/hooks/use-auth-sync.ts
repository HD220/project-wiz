// ===========================
// USE AUTH SYNC HOOK
// ===========================
// Hook that synchronizes authentication state with query cache

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/renderer/store/auth.store";

/**
 * Hook that manages the sync between auth state and queries
 * Ensures queries are properly invalidated when auth state changes
 */
export function useAuthSync() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user, getCurrentUser } = useAuthStore();
  const hasVerifiedSession = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !hasVerifiedSession.current) {
      // On first mount with persisted auth, verify session is still valid
      // This is non-blocking - it will update auth state if invalid
      getCurrentUser().catch(() => {
        // If verification fails, auth store will automatically clear state
        // and queries will be cleared in the next effect
      });
      hasVerifiedSession.current = true;
    }
  }, [isAuthenticated, user, getCurrentUser]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // When user becomes authenticated, invalidate all queries to refresh data
      queryClient.invalidateQueries();
    } else {
      // When user becomes unauthenticated, clear all queries
      queryClient.clear();
    }
  }, [isAuthenticated, user?.id, queryClient]);

  return { isAuthenticated, user };
}