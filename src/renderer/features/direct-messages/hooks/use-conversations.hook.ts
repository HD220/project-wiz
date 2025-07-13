import { useSyncExternalStore, useMemo, useRef, useEffect } from "react";
import { conversationStore } from "../stores/conversation.store";
import type {
  CreateConversationDto,
  ConversationDto,
} from "../../../../shared/types/message.types";

export function useConversations() {
  const state = useSyncExternalStore(
    conversationStore.subscribe,
    conversationStore.getSnapshot,
    conversationStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const loadInitialConversations = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await conversationStore.loadConversations();
      }
    };

    loadInitialConversations();
  }, []);

  const mutations = useMemo(() => ({
    createConversation: (data: CreateConversationDto) => conversationStore.createConversation(data),
    findOrCreateConversation: (data: { userId1: string, userId2: string }) =>
      conversationStore.findOrCreateConversation(data),
    deleteConversation: (id: string) => conversationStore.deleteConversation(id),
    setSelectedConversation: (conversation: ConversationDto | null) =>
      conversationStore.setSelectedConversation(conversation),
  }), []);

  const queries = useMemo(() => ({
    loadConversations: (forceReload?: boolean) =>
      conversationStore.loadConversations(forceReload),
    getConversationById: (id: string) => 
      conversationStore.getConversationById(id),
    refreshConversations: () => conversationStore.loadConversations(true),
  }), []);

  return {
    conversations: state.conversations,
    isLoading: state.isLoading,
    error: state.error,
    selectedConversation: state.selectedConversation,
    
    ...mutations,
    ...queries,
  };
}