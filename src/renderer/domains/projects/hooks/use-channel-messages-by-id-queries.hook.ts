import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { channelMessageService } from "../services/channel-message.service";
import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export function useChannelMessagesByIdQueries(channelId: string) {
  const queryClient = useQueryClient();

  const latestMessagesQuery = useQuery({
    queryKey: ["channelMessages", "channel", channelId, "latest"],
    queryFn: () => channelMessageService.getLatest(channelId, 50),
    enabled: !!channelId,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<CreateChannelMessageDto, "channelId">) =>
      channelMessageService.create({ ...data, channelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", "channel", channelId],
      });
    },
  });

  const createTextMutation = useMutation({
    mutationFn: ({
      content,
      authorId,
      authorName,
    }: {
      content: string;
      authorId: string;
      authorName: string;
    }) =>
      channelMessageService.createText(
        content,
        channelId,
        authorId,
        authorName,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channelMessages", "channel", channelId],
      });
    },
  });

  const searchQuery = useQuery({
    queryKey: ["channelMessages", "channel", channelId, "search"],
    queryFn: ({ queryKey }: any) => {
      const searchTerm = queryKey[4];
      return searchTerm
        ? channelMessageService.search(channelId, searchTerm)
        : [];
    },
    enabled: false,
  });

  return {
    messages: latestMessagesQuery.data || [],
    isLoading: latestMessagesQuery.isLoading,
    error: latestMessagesQuery.error?.message || null,
    createMessage: createMutation.mutate,
    sendTextMessage: createTextMutation.mutate,
    searchMessages: (searchTerm: string) =>
      queryClient.fetchQuery({
        queryKey: [
          "channelMessages",
          "channel",
          channelId,
          "search",
          searchTerm,
        ],
        queryFn: () => channelMessageService.search(channelId, searchTerm),
      }),
    refetch: latestMessagesQuery.refetch,
  };
}
