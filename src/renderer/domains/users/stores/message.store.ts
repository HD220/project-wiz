import { create } from "zustand";
import { MessageDto } from "../../../../shared/types/domains/users/message.types";

interface MessageState {
  currentConversationMessages: MessageDto[];
  setCurrentConversationMessages: (messages: MessageDto[]) => void;
}

export const useMessageStore = create<MessageState>((set: any) => ({
  currentConversationMessages: [],
  setCurrentConversationMessages: (messages: MessageDto[]) =>
    set({ currentConversationMessages: messages }),
}));
