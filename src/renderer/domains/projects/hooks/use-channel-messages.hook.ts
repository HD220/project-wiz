import { useChannelMessagesQueries } from './use-channel-messages-queries.hook';
import { useChannelMessageStore } from '../stores/channel-message.store';
import type { ChannelMessageFilterDto } from '../../../../shared/types/domains/projects/channel-message.types';

export function useChannelMessages(filter?: ChannelMessageFilterDto) {
  const queriesResult = useChannelMessagesQueries(filter);
  const { selectedMessage, setSelectedMessage } = useChannelMessageStore();

  const clearError = () => {
    // Error clearing is handled by TanStack Query automatically
  };

  const resetState = () => {
    setSelectedMessage(null);
  };

  return {
    ...queriesResult,
    selectedMessage,
    setSelectedMessage,
    clearError,
    resetState,
  };
}