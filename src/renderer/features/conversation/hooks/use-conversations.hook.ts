import { useQuery } from "@tanstack/react-query";

import type { DMConversation } from "@/shared/types/dm-conversation";

interface UseConversationsOptions {
  includeArchived?: boolean;
  includeInactive?: boolean;
}

interface UseConversationsReturn {
  conversations: DMConversation[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for managing conversation data with intelligent caching
 * 
 * @param options - Query options for filtering conversations
 * @returns Conversation data with loading states and controls
 */
export function useConversations(
  options: UseConversationsOptions = {}
): UseConversationsReturn {
  const { includeArchived = false, includeInactive = false } = options;

  const queryResult = useQuery({
    queryKey: ["conversations", { includeArchived, includeInactive }],
    queryFn: async () => {
      const response = await window.api.dm.list({
        includeArchived,
        includeInactive,
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