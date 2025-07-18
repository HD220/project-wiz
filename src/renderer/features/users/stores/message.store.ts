import { create } from "zustand";

import { MessageDto } from "../../../../shared/types/users/message.types";

interface MessageState {
  currentConversationMessages: MessageDto[];
  setCurrentConversationMessages: (messages: MessageDto[]) => void;
}

export const useMessageStore = create<MessageState>(
  (set: (state: MessageState) => void) => ({
    currentConversationMessages: [],
    setCurrentConversationMessages: (messages: MessageDto[]) =>
      set((state) => ({ ...state, currentConversationMessages: messages })),
  }),
);
