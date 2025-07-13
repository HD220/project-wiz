import { useSyncExternalStore, useMemo, useEffect, useRef } from "react";
import { messageStore } from "../stores/message.store";
import type {
  CreateMessageDto,
  UpdateMessageDto,
} from "../../../../shared/types/message.types";

export function useMessages(conversationId?: string) {
  const state = useSyncExternalStore(
    messageStore.subscribe,
    messageStore.getSnapshot,
    messageStore.getServerSnapshot,
  );

  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
    if (conversationId && window.electronIPC) {
      messageStore.loadMessages(conversationId);
    } else {
      messageStore.clearMessages();
    }
  }, [conversationId]);

  const mutations = useMemo(() => ({
    createMessage: (data: CreateMessageDto) => messageStore.createMessage(data),
    updateMessage: (data: UpdateMessageDto) => messageStore.updateMessage(data),
    deleteMessage: (id: string) => messageStore.deleteMessage(id),
  }), []);

  const queries = useMemo(() => ({
    loadMessages: (forceReload?: boolean) => {
      if (conversationIdRef.current) {
        messageStore.loadMessages(conversationIdRef.current, forceReload);
      }
    },
    getMessageById: (id: string) => 
      messageStore.getMessageById(id),
  }), []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    
    ...mutations,
    ...queries,
  };
}