// ===========================
// USE AVAILABLE USERS HOOK
// ===========================
// TanStack Query hook for available users (agents)

import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { ConversationAPI } from "@/renderer/features/conversation/api";

/**
 * Hook to get available users for creating conversations
 * Uses TanStack Query for caching
 */
export function useAvailableUsers() {
  const { auth } = useRouteContext({ from: "__root__" });
  const { isAuthenticated, user } = auth;

  const query = useQuery({
    queryKey: ["available-users"],
    queryFn: ConversationAPI.getAvailableUsers,
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
