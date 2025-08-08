import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

/**
 * Hook for unarchiving conversations
 * Handles unarchive mutation with automatic query invalidation
 */
export function useUnarchiveConversation() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (dmId: string) => window.api.dm.unarchive({ dmId }),
    {
      successMessage: "Conversation unarchived",
      errorMessage: "Failed to unarchive conversation",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      },
    },
  );
}