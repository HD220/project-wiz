import { useCallback } from "react";
import { useMessageStore } from "../stores/message.store";
import {
  useMessagesQuery,
  useMessageQuery,
  useCreateMessageMutation,
} from "./use-messages-queries.hook";
import type { CreateMessageDto } from "../../../../shared/types/domains/users/message.types";

export function useMessages(
  conversationId?: string,
  limit?: number,
  offset?: number,
) {
  const currentConversationMessages = useMessageStore(
    (state: any) => state.currentConversationMessages,
  );
  const setCurrentConversationMessages = useMessageStore(
    (state: any) => state.setCurrentConversationMessages,
  );

  const messagesQuery = useMessagesQuery(conversationId, limit, offset);
  const createMutation = useCreateMessageMutation();

  const createMessage = useCallback(
    (data: CreateMessageDto) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const clearMessages = useCallback(
    () => setCurrentConversationMessages([]),
    [setCurrentConversationMessages],
  );

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error?.message || null,

    createMessage,
    clearMessages,
  };
}

export function useMessage(id: string) {
  const messageQuery = useMessageQuery(id);

  return {
    message: messageQuery.data || null,
    isLoading: messageQuery.isLoading,
    error: messageQuery.error?.message || null,
  };
}
