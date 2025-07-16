import { useCallback } from "react";
import { useMessageValidation } from "./use-message-validation.hook";
import { useOptimisticDirectMessage } from "./use-optimistic-direct-message.hook";
import { useAgentCommunication } from "./use-agent-communication.hook";
import type { MessageDto } from "../../../../shared/types/domains/users/message.types";

interface DirectMessageSendProps {
  conversationId: string;
  setIsSending: (sending: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  setOptimisticMessages: (
    messages: MessageDto[] | ((prev: MessageDto[]) => MessageDto[]),
  ) => void;
  loadMessages: (conversationId: string) => Promise<void>;
}

export function useDirectMessageSend({
  conversationId,
  setIsSending,
  setIsTyping,
  setError,
  setOptimisticMessages,
  loadMessages,
}: DirectMessageSendProps) {
  const { validateMessage } = useMessageValidation();
  const { addOptimisticMessage, clearOptimisticMessages } = useOptimisticDirectMessage({
    conversationId,
    setOptimisticMessages,
  });
  const { sendToAgent } = useAgentCommunication({
    conversationId,
    setIsTyping,
    loadMessages,
  });

  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      validateMessage(content);
      setError(null);
      setIsSending(true);

      addOptimisticMessage(content);

      try {
        await sendToAgent(content);
        clearOptimisticMessages();
      } catch (err) {
        clearOptimisticMessages();
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        console.error("Failed to send message to agent:", err);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, validateMessage, addOptimisticMessage, sendToAgent, clearOptimisticMessages, setError, setIsSending],
  );

  return { sendMessage };
}