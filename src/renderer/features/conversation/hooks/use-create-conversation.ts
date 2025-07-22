// ===========================
// USE CREATE CONVERSATION HOOK
// ===========================
// TanStack Query mutation for creating conversations

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/renderer/store/auth.store";
import { conversationApi } from "../api";
import type { CreateConversationMutationResult } from "../types";

/**
 * Hook to create new conversations with automatic cache updates
 */
export function useCreateConversation(): CreateConversationMutationResult {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const mutation = useMutation({
    mutationFn: conversationApi.createConversation,
    
    onSuccess: (newConversation) => {
      // Invalidate conversations list to show new conversation
      queryClient.invalidateQueries({ 
        queryKey: ["conversations", user?.id] 
      });

      // Optionally: add the new conversation optimistically
      queryClient.setQueryData(
        ["conversations", user?.id],
        (old: any) => {
          if (!old) return [{ ...newConversation, lastMessage: undefined }];
          
          // Add new conversation at the beginning (most recent)
          return [
            { ...newConversation, lastMessage: undefined },
            ...old
          ];
        }
      );
    },

    onError: (error) => {
      console.error("Failed to create conversation:", error);
    },
  });

  return {
    createConversation: async (participantIds: string[]) => {
      const result = await mutation.mutateAsync(participantIds);
      return result.id;
    },
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}