import { useCallback } from 'react';
import { useConversationStore } from '../stores/conversation.store';
import {
  useConversationsQuery,
  useConversationQuery,
  useCreateConversationMutation,
  useFindOrCreateConversationMutation,
} from './use-conversations-queries.hook';
import type {
  ConversationFilterDto,
  CreateConversationDto,
} from '../../../../shared/types/domains/users/message.types';

export function useConversations(filter?: ConversationFilterDto) {
  const selectedConversation = useConversationStore((state: any) => state.selectedConversation);
  const setSelectedConversation = useConversationStore((state: any) => state.setSelectedConversation);
  
  const conversationsQuery = useConversationsQuery(filter);
  const createMutation = useCreateConversationMutation();
  const findOrCreateMutation = useFindOrCreateConversationMutation();

  const createConversation = useCallback(
    (data: CreateConversationDto) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const findOrCreateDirectMessage = useCallback(
    (participants: string[]) => findOrCreateMutation.mutateAsync(participants),
    [findOrCreateMutation]
  );

  const refreshConversations = useCallback(
    () => conversationsQuery.refetch(),
    [conversationsQuery]
  );

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error?.message || null,
    selectedConversation,

    createConversation,
    findOrCreateDirectMessage,
    setSelectedConversation,
    refreshConversations,
  };
}

export function useConversation(id: string) {
  const conversationQuery = useConversationQuery(id);

  return {
    conversation: conversationQuery.data || null,
    isLoading: conversationQuery.isLoading,
    error: conversationQuery.error?.message || null,
  };
}