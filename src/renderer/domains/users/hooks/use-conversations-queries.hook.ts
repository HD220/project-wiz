import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversation.service';
import { useConversationStore } from '../stores/conversation.store';
import type {
  ConversationDto,
  CreateConversationDto,
  ConversationFilterDto,
} from '../../../../shared/types/domains/users/message.types';

export function useConversationsQuery(filter?: ConversationFilterDto) {
  return useQuery({
    queryKey: ['conversations', filter],
    queryFn: () => conversationService.list(filter),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConversationQuery(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.getById(id),
    enabled: !!id,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationDto) => conversationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useFindOrCreateConversationMutation() {
  const queryClient = useQueryClient();
  const setSelectedConversation = useConversationStore((state: any) => state.setSelectedConversation);

  return useMutation({
    mutationFn: (participants: string[]) => conversationService.findOrCreate(participants),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(conversation);
    },
  });
}