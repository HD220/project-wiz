// ===========================
// USE CREATE CONVERSATION HOOK
// ===========================
// TanStack Query mutation for creating conversations

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import { conversationApi } from "@/renderer/features/conversation/api";
import type { CreateConversationMutationResult } from "@/renderer/features/conversation/types";

const routeApi = getRouteApi("/_authenticated");

/**
 * Hook to create new conversations with automatic cache updates
 */
export function useCreateConversation(): CreateConversationMutationResult {
  const queryClient = useQueryClient();
  const context = routeApi.useRouteContext();
  const { user, sessionToken } = context.auth;

  const mutation = useMutation({
    mutationFn: (participantIds: string[]) =>
      conversationApi.createConversation(participantIds, sessionToken!),

    onSuccess: (newConversation) => {
      // Invalidate conversations list to show new conversation
      queryClient.invalidateQueries({
        queryKey: ["conversations", user?.id],
      });

      // Optionally: add the new conversation optimistically
      queryClient.setQueryData(["conversations", user?.id], (old: any) => {
        if (!old) return [{ ...newConversation, lastMessage: undefined }];

        // Add new conversation at the beginning (most recent)
        return [{ ...newConversation, lastMessage: undefined }, ...old];
      });
    },

    onError: (error) => {
      console.error("Failed to create conversation:", error);
    },
  });

  return {
    createConversation: async (participantIds: string[]) => {
      if (!sessionToken) {
        throw new Error("Not authenticated");
      }
      const result = await mutation.mutateAsync(participantIds);
      return result.id;
    },
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}
