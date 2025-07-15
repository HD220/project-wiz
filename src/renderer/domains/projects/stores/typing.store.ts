import { create } from 'zustand';

interface TypingState {
  typingChannels: Record<string, { isTyping: boolean; timestamp: number }>;
  setTyping: (channelId: string, isTyping: boolean) => void;
}

export const useTypingStore = create<TypingState>((set: any) => ({
  typingChannels: {},
  setTyping: (channelId: string, isTyping: boolean) =>
    set((state: any) => ({
      typingChannels: {
        ...state.typingChannels,
        [channelId]: { isTyping, timestamp: Date.now() },
      },
    })),
}));