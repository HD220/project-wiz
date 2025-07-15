import { useState, useCallback } from 'react';
import { useChannelMessagesById } from './use-channel-messages-by-id.hook';
import { useTyping } from './use-typing.hook';
import { useAiChatMutations } from './use-ai-chat-mutations.hook';
import { useAiChatConfig } from './use-ai-chat-config.hook';
import { useAiChatUtilities } from './use-ai-chat-utilities.hook';
import { useAiChatStore } from '../stores/ai-chat.store';
import type {
  ChannelMessageDto,
  AISendMessageRequestDto,
  AIChatConfigDto,
} from '../../../../shared/types/domains/projects/channel-message.types';

interface UseChannelChatProps {
  channelId: string;
  llmProviderId?: string;
  authorId: string;
  authorName: string;
  aiName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useChannelChat(props: UseChannelChatProps) {
  const [error, setError] = useState<string | null>(null);
  
  const { messages, isLoading, refetch, clearError: clearChannelError } = useChannelMessagesById(props.channelId);
  const { isTyping, setTyping } = useTyping(props.channelId);
  const mutations = useAiChatMutations(props.channelId);
  const config = useAiChatConfig(props);
  const utilities = useAiChatUtilities(props.channelId, props.llmProviderId);
  const { optimisticMessages, addOptimisticMessage, clearOptimisticMessages } = useAiChatStore();

  const clearError = useCallback(() => {
    setError(null);
    clearChannelError();
  }, [clearChannelError]);

  const sendMessage = useCallback(
    async (content: string, customConfig?: Partial<AIChatConfigDto>) => {
      const optimisticMessage: ChannelMessageDto = {
        id: `temp-user-${Date.now()}`,
        content: content.trim(),
        channelId: props.channelId,
        authorId: props.authorId,
        authorName: props.authorName,
        type: "text",
        createdAt: new Date(),
        updatedAt: new Date(),
        isEdited: false,
        metadata: {},
      };

      addOptimisticMessage(optimisticMessage);
      setTyping(true);

      const currentConfigValue = config.propsRef.current;
      const requestData: AISendMessageRequestDto = {
        content: content.trim(),
        channelId: props.channelId,
        llmProviderId: customConfig?.llmProviderId || props.llmProviderId!,
        authorId: props.authorId,
        authorName: props.authorName,
        aiName: props.aiName,
        systemPrompt: customConfig?.systemPrompt || currentConfigValue.systemPrompt,
        temperature: customConfig?.temperature || currentConfigValue.temperature,
        maxTokens: customConfig?.maxTokens || currentConfigValue.maxTokens,
        includeHistory: customConfig?.includeHistory ?? currentConfigValue.includeHistory,
        historyLimit: customConfig?.historyLimit || currentConfigValue.historyLimit,
      };

      mutations.sendMessage(requestData);
      clearOptimisticMessages();
      setTyping(false);
    },
    [props, mutations, config.propsRef, addOptimisticMessage, clearOptimisticMessages, setTyping]
  );

  const allMessages = [...messages, ...optimisticMessages];

  return {
    messages: allMessages,
    isLoading,
    isSending: mutations.isSending,
    isRegenerating: mutations.isRegenerating,
    error: error || mutations.sendError || mutations.regenerateError,
    isTyping,
    sendMessage,
    clearError,
    setTyping,
    currentConfig: config.currentConfig,
    updateConfig: config.updateConfig,
    ...utilities,
    clearAIMessages: mutations.clearMessages,
    regenerateLastMessage: mutations.regenerateMessage,
  };
}