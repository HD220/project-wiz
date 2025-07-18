import { useState, useEffect } from "react";

import type { MessageDto } from "../../../../shared/types/domains/users/message.types";

export function useDirectMessageChatState(conversationId: string) {
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<MessageDto[]>(
    [],
  );

  useEffect(() => {
    setOptimisticMessages([]);
    setError(null);
    setIsTyping(false);
  }, [conversationId]);

  const clearError = () => {
    setError(null);
  };

  return {
    isSending,
    setIsSending,
    isTyping,
    setIsTyping,
    error,
    setError,
    optimisticMessages,
    setOptimisticMessages,
    clearError,
  };
}
