// ===========================
// USE AVAILABLE USERS HOOK
// ===========================
// TanStack Query hook for available users (agents)

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/renderer/store/auth.store";
import { conversationApi } from "../api";

/**
 * Hook to get available users for creating conversations
 * Uses TanStack Query for caching
 */
export function useAvailableUsers() {
  const { isAuthenticated, user } = useAuthStore();

  const query = useQuery({
    queryKey: ["available-users"],
    queryFn: conversationApi.getAvailableUsers,
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes (users don't change often)
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    availableUsers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}