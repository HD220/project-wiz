import { useQueryClient } from "@tanstack/react-query";

import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

/**
 * Hook for archiving conversations
 * Handles archive mutation with automatic query invalidation
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (dmId: string) => window.api.dm.archive({ dmId }),
    {
      successMessage: "Conversation archived",
      errorMessage: "Failed to archive conversation",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      },
    },
  );
}