import { create } from "zustand";

import { ConversationDto } from "../../../../shared/types/users/message.types";

interface ConversationState {
  selectedConversation: ConversationDto | null;
  setSelectedConversation: (conversation: ConversationDto | null) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conversation) =>
    set({ selectedConversation: conversation }),
}));
