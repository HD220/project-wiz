import { useChannelsQueries } from './use-channels-queries.hook';
import { useChannelStore } from '../stores/channel.store';
import type { ChannelFilterDto } from '../../../../shared/types/domains/projects/channel.types';

export function useChannels(filter?: ChannelFilterDto) {
  const queriesResult = useChannelsQueries(filter);
  const { selectedChannel, setSelectedChannel } = useChannelStore();

  const getChannelById = async (id: string) => {
    const channel = queriesResult.channels.find(ch => ch.id === id);
    return channel || null;
  };

  const clearError = () => {
    // Error clearing is handled by TanStack Query automatically
  };

  return {
    ...queriesResult,
    selectedChannel,
    setSelectedChannel,
    getChannelById,
    clearError,
  };
}