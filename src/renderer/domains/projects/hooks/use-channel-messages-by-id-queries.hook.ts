import { useChannelMessagesMutations } from "./use-channel-messages-mutations.hook";
import { useChannelMessagesQuery } from "./use-channel-messages-query.hook";
import { useChannelMessagesSearch } from "./use-channel-messages-search.hook";

export function useChannelMessagesByIdQueries(channelId: string) {
  const query = useChannelMessagesQuery(channelId);
  const mutations = useChannelMessagesMutations();
  const search = useChannelMessagesSearch(channelId);

  return {
    messages: query.data || [],
    isLoading: query.isLoading,
    error: query.error?.message || null,
    createMessage: mutations.createMessage,
    createTextMessage: mutations.createTextMessage,
    searchMessages: search.searchMessages,
    refetch: query.refetch,
  };
}
