// ===========================
// USE CONVERSATIONS HOOK
// ===========================
// TanStack Query hook for conversations list

import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { conversationApi } from "../api";

import type { ConversationsQueryResult } from "../types";

const routeApi = getRouteApi("/_authenticated");

/**
 * Hook to get conversations for current user
 * Uses TanStack Query for caching and background updates
 */
export function useConversations(): ConversationsQueryResult {
  const context = routeApi.useRouteContext();
  const { isAuthenticated, user, sessionToken } = context.auth;

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => conversationApi.getUserConversations(sessionToken!),
    enabled: isAuthenticated && !!user && !!sessionToken,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (
        error?.message?.includes("authentication") ||
        error?.message?.includes("unauthorized")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    conversations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
