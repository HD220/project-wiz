import { DirectMessageChatService } from "../services/direct-message-chat.service";

interface UseAgentCommunicationProps {
  conversationId: string;
  setIsTyping: (typing: boolean) => void;
  loadMessages: (conversationId: string) => Promise<void>;
}

export function useAgentCommunication({
  conversationId,
  setIsTyping,
  loadMessages,
}: UseAgentCommunicationProps) {
  const sendToAgent = async (content: string): Promise<void> => {
    setIsTyping(true);

    try {
      const response = await DirectMessageChatService.sendToAgent(
        conversationId,
        content.trim(),
        "user",
      );

      await loadMessages(conversationId);
      console.log("Agent response generated successfully:", response);
    } finally {
      setIsTyping(false);
    }
  };

  return { sendToAgent };
}