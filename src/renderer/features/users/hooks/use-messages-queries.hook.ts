import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { messageService } from "../services/message.service";

import type { CreateMessageDto } from "../../../../shared/types/users/message.types";

export function useMessagesQuery(
  conversationId?: string,
  limit?: number,
  offset?: number,
) {
  return useQuery({
    queryKey: ["messages", conversationId, limit, offset],
    queryFn: () =>
      messageService.listByConversation(conversationId!, limit, offset),
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000,
  });
}

export function useMessageQuery(id: string) {
  return useQuery({
    queryKey: ["message", id],
    queryFn: () => messageService.getById(id),
    enabled: !!id,
  });
}

export function useCreateMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMessageDto) => messageService.create(data),
    onSuccess: (_, variables) => {
      const conversationId = variables.conversationId || variables.contextId;
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }
    },
  });
}
