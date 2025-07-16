import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiChatService } from "../services/ai-chat.service";
import type {
  AISendMessageRequestDto,
  AIRegenerateMessageRequestDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export function useAiChatMutations(channelId: string) {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (data: AISendMessageRequestDto) =>
      aiChatService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", "channel", channelId],
      });
    },
  });

  const regenerateMessageMutation = useMutation({
    mutationFn: (data: AIRegenerateMessageRequestDto) =>
      aiChatService.regenerateMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", "channel", channelId],
      });
    },
  });

  const clearMessagesMutation = useMutation({
    mutationFn: () => aiChatService.clearMessages(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", "channel", channelId],
      });
    },
  });

  return {
    sendMessage: sendMessageMutation.mutate,
    regenerateMessage: regenerateMessageMutation.mutate,
    clearMessages: clearMessagesMutation.mutate,
    isSending: sendMessageMutation.isPending,
    isRegenerating: regenerateMessageMutation.isPending,
    sendError: sendMessageMutation.error?.message || null,
    regenerateError: regenerateMessageMutation.error?.message || null,
  };
}
