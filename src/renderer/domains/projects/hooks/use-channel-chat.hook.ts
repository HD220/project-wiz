import { useCallback } from "react";

import type { AIChatConfigDto } from "../../../../shared/types/domains/projects/channel-message.types";
import { useAiChatConfig } from "./use-ai-chat-config.hook";
import { useAiChatMutations } from "./use-ai-chat-mutations.hook";
import { useAiChatUtilities } from "./use-ai-chat-utilities.hook";
import { useChannelChatMessages } from "./use-channel-chat-messages.hook";
import { useOptimisticMessage } from "./use-optimistic-message.hook";
import { useRequestDataBuilder } from "./use-request-data-builder.hook";
import { useTyping } from "./use-typing.hook";

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
  const messagesHook = useChannelChatMessages(props.channelId);
  const { isTyping, setTyping } = useTyping(props.channelId);
  const config = useAiChatConfig(props);
  const utilities = useAiChatUtilities(props.channelId, props.llmProviderId);
  
  const mutations = useAiChatMutations(props.channelId);
  const { createOptimisticMessage } = useOptimisticMessage(props);
  const { createRequestData } = useRequestDataBuilder({
    ...props,
    propsRef: config.propsRef,
  });

  const sendMessage = useCallback(
    async (content: string, customConfig?: Partial<AIChatConfigDto>) => {
      const optimisticMessage = createOptimisticMessage(content);
      messagesHook.addOptimisticMessage(optimisticMessage);
      setTyping(true);

      const requestData = createRequestData(content, customConfig);
      mutations.sendMessage(requestData);
      messagesHook.clearOptimisticMessages();
      setTyping(false);
    },
    [createOptimisticMessage, createRequestData, mutations, messagesHook, setTyping],
  );

  const error =
    messagesHook.error ||
    mutations.sendError ||
    mutations.regenerateError;

  return {
    messages: messagesHook.messages,
    isLoading: messagesHook.isLoading,
    isSending: mutations.isSending,
    isRegenerating: mutations.isRegenerating,
    error,
    isTyping,
    sendMessage,
    clearError: messagesHook.clearError,
    setTyping,
    currentConfig: config.currentConfig,
    updateConfig: config.updateConfig,
    ...utilities,
    clearAIMessages: mutations.clearMessages,
    regenerateLastMessage: mutations.regenerateMessage,
  };
}
