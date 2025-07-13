import { useSyncExternalStore, useEffect, useMemo, useRef } from "react";
import { channelStore } from "../stores/channel.store";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelFilterDto,
  ChannelDto 
} from "../../../../shared/types/channel.types";

export function useChannels(filter?: ChannelFilterDto) {
  const state = useSyncExternalStore(
    channelStore.subscribe,
    channelStore.getSnapshot,
    channelStore.getServerSnapshot,
  );

  const hasLoadedRef = useRef(false);
  const filterRef = useRef(filter);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    const loadInitialChannels = async () => {
      if (window.electronIPC && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        await channelStore.loadChannels(filterRef.current);
      }
    };

    loadInitialChannels();
  }, []);

  const mutations = useMemo(() => ({
    createChannel: (data: CreateChannelDto) => 
      channelStore.createChannel(data),
    
    updateChannel: (data: UpdateChannelDto) => 
      channelStore.updateChannel(data),
    
    archiveChannel: (id: string) => 
      channelStore.archiveChannel(id),
    
    deleteChannel: (id: string) => 
      channelStore.deleteChannel(id),
      
    setSelectedChannel: (channel: ChannelDto | null) => 
      channelStore.setSelectedChannel(channel),
      
    clearError: () => channelStore.clearError(),
  }), []);

  const queries = useMemo(() => ({
    loadChannels: (newFilter?: ChannelFilterDto, forceReload?: boolean) => 
      channelStore.loadChannels(newFilter || filterRef.current, forceReload),
      
    getChannelById: (id: string) => 
      channelStore.getChannelById(id),
      
    refetch: () => 
      channelStore.loadChannels(filterRef.current, true),
  }), [filter]);

  return {
    channels: state.channels,
    isLoading: state.isLoading,
    error: state.error,
    selectedChannel: state.selectedChannel,
    ...mutations,
    ...queries,
  };
}