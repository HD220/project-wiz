import { useQuery } from "@tanstack/react-query";

import type { DMConversation } from "@/shared/types/dm-conversation";

interface UseConversationsReturn {
  conversations: DMConversation[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for managing conversation data
 * Fetches all conversations and filters on frontend for simplicity
 */
export function useConversations(): UseConversationsReturn {
  const queryResult = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await window.api.dm.list({
        includeArchived: true,
        includeInactive: false,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to load conversations");
      }

      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error.message.includes("not authenticated")) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    conversations: queryResult.data || [],
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}