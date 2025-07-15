import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { channelMessageService } from '../services/channel-message.service';
import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto,
} from '../../../../shared/types/domains/projects/channel-message.types';

export function useChannelMessagesQueries(filter?: ChannelMessageFilterDto) {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: ['channelMessages', filter],
    queryFn: () => channelMessageService.list(filter),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateChannelMessageDto) => channelMessageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages'] });
    },
  });

  const createTextMutation = useMutation({
    mutationFn: ({ content, channelId, authorId, authorName }: {
      content: string;
      channelId: string;
      authorId: string;
      authorName: string;
    }) => channelMessageService.createText(content, channelId, authorId, authorName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateChannelMessageDto) => channelMessageService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => channelMessageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channelMessages'] });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error?.message || null,
    createMessage: createMutation.mutate,
    createTextMessage: createTextMutation.mutate,
    updateMessage: updateMutation.mutate,
    deleteMessage: deleteMutation.mutate,
    refetch: messagesQuery.refetch,
  };
}