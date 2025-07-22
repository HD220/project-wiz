// ===========================
// USE CONVERSATIONS HOOK
// ===========================
// TanStack Query hook for conversations list

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/renderer/store/auth.store";
import { conversationApi } from "../api";
import type { ConversationsQueryResult } from "../types";

/**
 * Hook to get conversations for current user
 * Uses TanStack Query for caching and background updates
 */
export function useConversations(): ConversationsQueryResult {
  const { isAuthenticated, user } = useAuthStore();

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: conversationApi.getUserConversations,
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 2, // Reduced to 2 minutes for better refresh
    gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Force retry on authentication state change
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('authentication') || error?.message?.includes('unauthorized')) {
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