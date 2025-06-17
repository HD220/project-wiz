import { create } from 'zustand';
import { PlaceholderChatMessage, placeholderDirectMessages } from '../lib/placeholders';

interface DirectMessagesState {
  messages: PlaceholderChatMessage[];
  isLoading: boolean;
  fetchMessages: () => Promise<void>; // In a real app, this might take a threadId or userId
}

export const useDirectMessagesStore = create<DirectMessagesState>((set) => ({
  messages: [],
  isLoading: false,
  fetchMessages: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ messages: placeholderDirectMessages, isLoading: false });
  },
}));
