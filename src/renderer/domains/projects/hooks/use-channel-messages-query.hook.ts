import { useQuery } from "@tanstack/react-query";
import { channelMessageService } from "../services/channel-message.service";

export function useChannelMessagesQuery(channelId: string) {
  return useQuery({
    queryKey: ["channelMessages", "channel", channelId, "latest"],
    queryFn: () => channelMessageService.getLatest(channelId, 50),
    enabled: !!channelId,
  });
}