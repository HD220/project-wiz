import { DirectMessageChatService } from "../services/direct-message-chat.service";
import type { MessageDto } from "../../../../shared/types/domains/users/message.types";

interface UseOptimisticDirectMessageProps {
  conversationId: string;
  setOptimisticMessages: (
    messages: MessageDto[] | ((prev: MessageDto[]) => MessageDto[]),
  ) => void;
}

export function useOptimisticDirectMessage({
  conversationId,
  setOptimisticMessages,
}: UseOptimisticDirectMessageProps) {
  const addOptimisticMessage = (content: string): void => {
    const optimisticMessage = DirectMessageChatService.createOptimisticMessage(
      content,
      conversationId,
    );
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);
  };

  const clearOptimisticMessages = (): void => {
    setOptimisticMessages([]);
  };

  return {
    addOptimisticMessage,
    clearOptimisticMessages,
  };
}