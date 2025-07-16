import { useCallback } from "react";

import { DirectMessageChatService } from "../services/direct-message-chat.service";

interface DirectMessageRegenerateProps {
  conversationId: string;
  setIsTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  loadMessages: (conversationId: string) => Promise<void>;
}

export function useDirectMessageRegenerate({
  conversationId,
  setIsTyping,
  setError,
  loadMessages,
}: DirectMessageRegenerateProps) {
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

  return { regenerateLastMessage };
}