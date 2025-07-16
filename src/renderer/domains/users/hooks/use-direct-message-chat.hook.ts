import { useMessages } from "./use-messages.hook";
import { useDirectMessageChatState } from "./use-direct-message-chat-state.hook";
import { useDirectMessageChatActions } from "./use-direct-message-chat-actions.hook";

import type { MessageDto } from "../../../../shared/types/domains/users/message.types";

interface UseDirectMessageChatProps {
  conversationId: string;
}

interface UseDirectMessageChatReturn {
  messages: MessageDto[];
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  regenerateLastMessage: () => Promise<void>;
  clearError: () => void;
  setTyping: (typing: boolean) => void;
}

export function useDirectMessageChat({
  conversationId,
}: UseDirectMessageChatProps): UseDirectMessageChatReturn {
  const {
    isSending,
    setIsSending,
    isTyping,
    setIsTyping,
    error,
    setError,
    optimisticMessages,
    setOptimisticMessages,
    clearError,
  } = useDirectMessageChatState(conversationId);

  const {
    messages: dbMessages,
    isLoading,
    loadMessages,
  } = useMessages(conversationId);

  const { sendMessage, regenerateLastMessage } = useDirectMessageChatActions({
    conversationId,
    setIsSending,
    setIsTyping,
    setError,
    setOptimisticMessages,
    loadMessages,
  });

  const messages = [
    ...dbMessages,
    ...optimisticMessages.filter(
      (msg) => msg.conversationId === conversationId,
    ),
  ];

  return {
    messages,
    isLoading,
    isSending,
    isTyping,
    error,
    sendMessage,
    regenerateLastMessage,
    clearError,
    setTyping: setIsTyping,
  };
}
