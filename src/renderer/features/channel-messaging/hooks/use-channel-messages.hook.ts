import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";

import { channelMessageStore } from "../stores/channel-message.store";

import type {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessageDto,
} from "../../../../shared/types/channel-message.types";

export function useChannelMessages(filter?: ChannelMessageFilterDto) {
  const state = useSyncExternalStore(
    channelMessageStore.subscribe,
    channelMessageStore.getSnapshot,
    channelMessageStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  // Auto-loading quando electronIPC fica disponível
  useEffect(() => {
    const loadInitialMessages = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await channelMessageStore.loadMessages(filterRef.current);
      }
    };

    loadInitialMessages();
  }, []);

  // Mutations - memoizadas para evitar re-renders
  const mutations = useMemo(
    () => ({
      createMessage: (data: CreateChannelMessageDto) =>
        channelMessageStore.createMessage(data),

      createTextMessage: (
        content: string,
        channelId: string,
        authorId: string,
        authorName: string,
      ) =>
        channelMessageStore.createTextMessage(
          content,
          channelId,
          authorId,
          authorName,
        ),

      updateMessage: (data: UpdateChannelMessageDto) =>
        channelMessageStore.updateMessage(data),

      deleteMessage: (id: string, channelId: string) =>
        channelMessageStore.deleteMessage(id, channelId),

      setSelectedMessage: (message: ChannelMessageDto | null) =>
        channelMessageStore.setSelectedMessage(message),

      clearError: () => channelMessageStore.clearError(),

      resetState: () => channelMessageStore.resetState(),
    }),
    [],
  );

  // Queries - memoizadas
  const queries = useMemo(
    () => ({
      loadMessages: (
        newFilter?: ChannelMessageFilterDto,
        forceReload?: boolean,
      ) =>
        channelMessageStore.loadMessages(
          newFilter || filterRef.current,
          forceReload,
        ),

      getMessageById: (id: string) => channelMessageStore.getMessageById(id),

      searchMessages: (channelId: string, searchTerm: string, limit?: number) =>
        channelMessageStore.searchMessages(channelId, searchTerm, limit),

      getLastMessage: (channelId: string) =>
        channelMessageStore.getLastMessage(channelId),

      refetch: () => channelMessageStore.loadMessages(filterRef.current, true),
    }),
    [],
  );

  return {
    // Estado
    messagesByChannel: state.messagesByChannel,
    isLoading: state.isLoading,
    error: state.error,
    selectedMessage: state.selectedMessage,
    isLoadingMore: state.isLoadingMore,

    // Operações
    ...mutations,
    ...queries,
  };
}

// Hook específico para mensagens de um canal
export function useChannelMessagesById(channelId: string) {
  const state = useSyncExternalStore(
    channelMessageStore.subscribe,
    channelMessageStore.getSnapshot,
    channelMessageStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const channelIdRef = useRef(channelId);

  // Resetar se o canal mudou
  useEffect(() => {
    if (channelIdRef.current !== channelId) {
      channelIdRef.current = channelId;
      hasLoadedRef.current = false;
      // Não resetar completamente, apenas marcar para recarregar
    }
  }, [channelId]);

  // Auto-loading quando electronIPC fica disponível
  useEffect(() => {
    const loadChannelMessages = async () => {
      if (window.electronIPC && !hasLoadedRef.current && channelId) {
        hasLoadedRef.current = true;
        await channelMessageStore.loadLatestMessages(channelId);
      }
    };

    loadChannelMessages();
  }, [channelId]);

  // Filtrar mensagens apenas do canal atual
  const channelMessages = useMemo(
    () => state.messagesByChannel[channelId] || [],
    [state.messagesByChannel, channelId],
  );

  return {
    // Estado filtrado para o canal
    messages: channelMessages,
    isLoading: state.isLoading,
    error: state.error,
    selectedMessage: state.selectedMessage,
    isLoadingMore: state.isLoadingMore,

    // Mutations específicas do canal
    createMessage: (data: Omit<CreateChannelMessageDto, "channelId">) =>
      channelMessageStore.createMessage({ ...data, channelId }),

    sendTextMessage: (content: string, authorId: string, authorName: string) =>
      channelMessageStore.createTextMessage(
        content,
        channelId,
        authorId,
        authorName,
      ),

    updateMessage: channelMessageStore.updateMessage,
    deleteMessage: (messageId: string) =>
      channelMessageStore.deleteMessage(messageId, channelId),
    setSelectedMessage: channelMessageStore.setSelectedMessage,
    clearError: channelMessageStore.clearError,

    // Queries específicas do canal
    loadMessages: (limit?: number, offset?: number, forceReload?: boolean) =>
      channelMessageStore.loadMessagesByChannel(
        channelId,
        limit,
        offset,
        forceReload,
      ),

    loadLatestMessages: (limit?: number, forceReload?: boolean) =>
      channelMessageStore.loadLatestMessages(channelId, limit),

    searchMessages: (searchTerm: string, limit?: number) =>
      channelMessageStore.searchMessages(channelId, searchTerm, limit),

    getLastMessage: () => channelMessageStore.getLastMessage(channelId),

    getMessageById: channelMessageStore.getMessageById,
    refetch: () => channelMessageStore.loadLatestMessages(channelId, 50),
  };
}
