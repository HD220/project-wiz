// ===========================
// USE MESSAGES HOOK
// ===========================
// TanStack Query hook for messages in a specific conversation

import { useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { messageApi } from "@/renderer/features/conversation/api";
import type { MessagesQueryResult } from "@/renderer/features/conversation/types";

/**
 * Hook to get messages for a specific conversation
 * Uses TanStack Query for caching and real-time updates
 * Gets user from router context for better performance
 */
export function useMessages(
  conversationId: string | null,
): MessagesQueryResult {
  const { auth } = useRouteContext({ from: "__root__" });
  const { isAuthenticated, user } = auth;

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => {
      if (!conversationId) throw new Error("No conversation ID");
      return messageApi.getConversationWithMessages(conversationId);
    },
    enabled: isAuthenticated && !!user && !!conversationId,
    staleTime: 1000 * 30, // 30 seconds (shorter for real-time feel)
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 10, // Poll every 10 seconds for new messages
  });

  return {
    conversation: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
