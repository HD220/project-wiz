import { useSyncExternalStore, useMemo, useEffect } from "react";
import { messageStore } from "../stores/message.store";
import type {
  CreateMessageDto,
  MessageDto,
} from "../../../../shared/types/message.types";

export function useMessages(conversationId?: string) {
  const state = useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getServerSnapshot,
  );

  // Load messages when conversationId changes
  useEffect(() => {
    if (conversationId && window.electronIPC) {
      messageStore.loadMessages(conversationId);
    } else {
      messageStore.clearMessages();
    }
  }, [conversationId]);

  const mutations = useMemo(
    () => ({
      createMessage: (data: CreateMessageDto) =>
        messageStore.createMessage(data),
    }),
    [],
  );

  const queries = useMemo(
    () => ({
      loadMessages: (convId: string, limit?: number, offset?: number) =>
        messageStore.loadMessages(convId, limit, offset),
      getMessageById: (id: string) => messageStore.getMessageById(id),
    }),
    [],
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,

    ...mutations,
    ...queries,
  };
}
