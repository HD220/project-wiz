import type { MessageDto } from "../../../../shared/types/domains/users/message.types";
import { useDirectMessageSend } from "./use-direct-message-send.hook";
import { useDirectMessageRegenerate } from "./use-direct-message-regenerate.hook";

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

export function useDirectMessageChatActions(props: DirectMessageChatActionsProps) {
  const { sendMessage } = useDirectMessageSend(props);
  const { regenerateLastMessage } = useDirectMessageRegenerate(props);

  return {
    sendMessage,
    regenerateLastMessage,
  };
}