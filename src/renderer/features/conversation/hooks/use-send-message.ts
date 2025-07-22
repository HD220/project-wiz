// ===========================
// USE SEND MESSAGE HOOK
// ===========================
// TanStack Query mutation for sending messages with optimistic updates

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/renderer/store/auth.store";
import { messageApi } from "../api";
import type { SendMessageInput, SendMessageMutationResult } from "../types";

/**
 * Hook to send messages with optimistic updates and cache invalidation
 * Provides instant UX feedback
 */
export function useSendMessage(): SendMessageMutationResult {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const mutation = useMutation({
    mutationFn: messageApi.sendMessage,
    
    // Optimistic update: add message immediately to UI
    onMutate: async (newMessage: SendMessageInput) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ 
        queryKey: ["messages", newMessage.conversationId] 
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData([
        "messages", 
        newMessage.conversationId
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["messages", newMessage.conversationId],
        (old: any) => {
          if (!old) return old;
          
          const optimisticMessage = {
            id: `temp-${Date.now()}`, // Temporary ID
            conversationId: newMessage.conversationId,
            authorId: newMessage.authorId,
            content: newMessage.content,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            ...old,
            messages: [...(old.messages || []), optimisticMessage],
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousMessages };
    },

    // On success: invalidate and refetch
    onSuccess: (_, variables) => {
      // Invalidate conversations to update last message
      queryClient.invalidateQueries({ 
        queryKey: ["conversations", user?.id] 
      });
      
      // Invalidate messages to get real data from server
      queryClient.invalidateQueries({ 
        queryKey: ["messages", variables.conversationId] 
      });
    },

    // On error: rollback to previous state
    onError: (_, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", variables.conversationId],
          context.previousMessages
        );
      }
    },

    // Always refetch after error or success
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["messages", variables.conversationId] 
      });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error,
  };
}