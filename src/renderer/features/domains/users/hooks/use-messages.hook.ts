import { useCallback } from "react";

import { useMessageStore } from "../stores/message.store";

import {
  useCreateMessageMutation,
  useMessageQuery,
  useMessagesQuery,
} from "./use-messages-queries.hook";

import type { CreateMessageDto } from "../../../../shared/types/users/message.types";
import type { MessageState } from "../stores/message.store";

export function useMessages(
  conversationId?: string,
  limit?: number,
  offset?: number,
) {
  const currentConversationMessages = useMessageStore(
    (state: MessageState) => state.currentConversationMessages,
  );
  const setCurrentConversationMessages = useMessageStore(
    (state: MessageState) => state.setCurrentConversationMessages,
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
    loadMessages: messagesQuery.refetch,

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
