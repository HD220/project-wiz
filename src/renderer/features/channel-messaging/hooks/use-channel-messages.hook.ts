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

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    const loadInitialMessages = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await channelMessageStore.loadMessages(filterRef.current);
      }
    };

    loadInitialMessages();
  }, []);

  const mutations = useMemo(() => ({
    createMessage: (data: CreateChannelMessageDto) =>
      channelMessageStore.createMessage(data),

    updateMessage: (data: UpdateChannelMessageDto) =>
      channelMessageStore.updateMessage(data),

    deleteMessage: (id: string) =>
      channelMessageStore.deleteMessage(id),
    
    setSelectedMessage: (message: ChannelMessageDto | null) =>
      channelMessageStore.setSelectedMessage(message),
  }), []);

  const queries = useMemo(() => ({
    loadMessages: (newFilter?: ChannelMessageFilterDto, forceReload?: boolean) =>
      channelMessageStore.loadMessages(newFilter || filterRef.current, forceReload),

    getMessageById: (id: string) =>
      channelMessageStore.getMessageById(id),

    refetch: () =>
      channelMessageStore.loadMessages(filterRef.current, true),
  }), [filter]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    selectedMessage: state.selectedMessage,
    ...mutations,
    ...queries,
  };
}