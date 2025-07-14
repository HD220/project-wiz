import { useSyncExternalStore, useMemo, useRef, useEffect } from "react";

import { conversationStore } from "../stores/conversation.store";

import type {
  ConversationFilterDto,
  CreateConversationDto,
  ConversationDto,
} from "../../../../shared/types/message.types";

export function useConversations(filter?: ConversationFilterDto) {
  const state = useSyncExternalStore(
    conversationStore.subscribe,
    conversationStore.getSnapshot,
    conversationStore.getServerSnapshot,
  );

  const filterRef = useRef(filter);
  const hasLoadedRef = useRef(false);

  // Update filter ref when filter changes
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  // Load conversations only once when component mounts or when electronIPC becomes available
  useEffect(() => {
    const loadInitialConversations = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await conversationStore.loadConversations(filterRef.current);
      }
    };

    loadInitialConversations();
  }, []);

  const mutations = useMemo(
    () => ({
      createConversation: (data: CreateConversationDto) =>
        conversationStore.createConversation(data),
      findOrCreateDirectMessage: (participants: string[]) =>
        conversationStore.findOrCreateDirectMessage(participants),
      setSelectedConversation: (conversation: ConversationDto | null) =>
        conversationStore.setSelectedConversation(conversation),
    }),
    [],
  );

  const queries = useMemo(
    () => ({
      loadConversations: (newFilter?: ConversationFilterDto) =>
        conversationStore.loadConversations(newFilter || filterRef.current),
      getConversationById: (id: string) =>
        conversationStore.getConversationById(id),
      refreshConversations: () =>
        conversationStore.loadConversations(filterRef.current),
    }),
    [],
  );

  return {
    conversations: state.conversations,
    isLoading: state.isLoading,
    error: state.error,
    selectedConversation: state.selectedConversation,

    ...mutations,
    ...queries,
  };
}
