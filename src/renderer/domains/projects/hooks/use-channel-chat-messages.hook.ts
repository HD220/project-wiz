import { useState, useCallback } from "react";

import { useAiChatStore } from "../stores/ai-chat.store";

import { useChannelMessagesById } from "./use-channel-messages-by-id.hook";

interface HookError extends Error {
  message: string;
}

export function useChannelChatMessages(channelId: string) {
  const [error, setError] = useState<HookError | null>(null);

  const {
    messages,
    isLoading,
    refetch,
    clearError: clearChannelError,
  } = useChannelMessagesById(channelId);

  const { optimisticMessages, addOptimisticMessage, clearOptimisticMessages } =
    useAiChatStore();

  const clearError = useCallback(() => {
    setError(null);
    clearChannelError();
  }, [clearChannelError]);

  const allMessages = [...messages, ...optimisticMessages];

  return {
    messages: allMessages,
    isLoading,
    error,
    refetch,
    clearError,
    addOptimisticMessage,
    clearOptimisticMessages,
  };
}
