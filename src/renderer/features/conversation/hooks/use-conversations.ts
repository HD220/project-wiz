// ===========================
// USE CONVERSATIONS HOOK
// ===========================
// TanStack Query hook for conversations list

import { useQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { ConversationAPI } from "@/renderer/features/conversation/api/conversation.api";
import type { ConversationsQueryResult } from "@/renderer/features/conversation/types";

const routeApi = getRouteApi("/_authenticated");

export function useConversations(): ConversationsQueryResult {
  const context = routeApi.useRouteContext();
  const { isAuthenticated, user } = context.auth;

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => ConversationAPI.getUserConversations(user!.id),
    enabled: isAuthenticated && !!user,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
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
