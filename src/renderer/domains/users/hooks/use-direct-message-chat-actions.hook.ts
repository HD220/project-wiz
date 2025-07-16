import { useCallback } from "react";

import { DirectMessageChatService } from "../services/direct-message-chat.service";
import type { MessageDto } from "../../../../shared/types/domains/users/message.types";

interface DirectMessageChatActionsProps {
  conversationId: string;
  setIsSending: (sending: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  setOptimisticMessages: (
    messages: MessageDto[] | ((prev: MessageDto[]) => MessageDto[]),
  ) => void;
  loadMessages: (conversationId: string) => Promise<void>;
}

export function useDirectMessageChatActions({
  conversationId,
  setIsSending,
  setIsTyping,
  setError,
  setOptimisticMessages,
  loadMessages,
}: DirectMessageChatActionsProps) {
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      if (!content.trim()) {
        throw new Error("Mensagem não pode estar vazia");
      }

      setError(null);
      setIsSending(true);

      const optimisticUserMessage =
        DirectMessageChatService.createOptimisticMessage(
          content,
          conversationId,
        );

      setOptimisticMessages((prev) => [...prev, optimisticUserMessage]);

      try {
        setIsTyping(true);

        const response = await DirectMessageChatService.sendToAgent(
          conversationId,
          content.trim(),
          "user",
        );

        setOptimisticMessages([]);
        setIsTyping(false);
        await loadMessages(conversationId);

        console.log("Agent response generated successfully:", response);
      } catch (err) {
        setOptimisticMessages([]);
        setIsTyping(false);

        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Failed to send message to agent:", err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [
      conversationId,
      loadMessages,
      setError,
      setIsSending,
      setIsTyping,
      setOptimisticMessages,
    ],
  );

  const regenerateLastMessage = useCallback(async (): Promise<void> => {
    setError(null);
    setIsTyping(true);

    try {
      const regeneratedMessage =
        await DirectMessageChatService.regenerateResponse(
          conversationId,
          "user",
        );

      await loadMessages(conversationId);

      console.log("Message regenerated successfully:", regeneratedMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("Failed to regenerate message:", err);
      throw err;
    } finally {
      setIsTyping(false);
    }
  }, [conversationId, loadMessages, setError, setIsTyping]);

  return {
    sendMessage,
    regenerateLastMessage,
  };
}
