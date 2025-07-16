import { useQueryClient } from "@tanstack/react-query";

import { channelMessageService } from "../services/channel-message.service";

export function useChannelMessagesSearch(channelId: string) {
  const queryClient = useQueryClient();

  const searchMessages = (searchTerm: string) =>
    queryClient.fetchQuery({
      queryKey: ["channelMessages", "channel", channelId, "search", searchTerm],
      queryFn: () => channelMessageService.search(channelId, searchTerm),
    });

  return { searchMessages };
}
