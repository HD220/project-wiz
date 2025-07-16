import { useQuery } from "@tanstack/react-query";
import { channelMessageService } from "../services/channel-message.service";
import { useChannelMessagesMutations } from "./use-channel-messages-mutations.hook";
import type {
  ChannelMessageFilterDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export function useChannelMessagesQueries(filter?: ChannelMessageFilterDto) {
  const messagesQuery = useQuery({
    queryKey: ["channelMessages", filter],
    queryFn: () => channelMessageService.list(filter),
  });

  const mutations = useChannelMessagesMutations();

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error?.message || null,
    refetch: messagesQuery.refetch,
    ...mutations,
  };
}
