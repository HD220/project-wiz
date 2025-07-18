import type { MessageDto } from "../../../../shared/types/users/message.types";

export interface DirectMessageSendProps {
  conversationId: string;
  setIsSending: (sending: boolean) => void;
  setIsTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;
  setOptimisticMessages: (
    messages: MessageDto[] | ((prev: MessageDto[]) => MessageDto[]),
  ) => void;
  loadMessages: (conversationId: string) => Promise<void>;
}
