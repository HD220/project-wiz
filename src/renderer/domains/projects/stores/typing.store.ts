import { create } from "zustand";

export type ChannelTypingInfo = { isTyping: boolean; timestamp: number };

interface TypingState {
  typingChannels: Record<string, ChannelTypingInfo>;
  setTyping: (channelId: string, isTyping: boolean) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingChannels: {},
  setTyping: (channelId: string, isTyping: boolean) =>
    set((state: TypingState) => ({
      typingChannels: {
        ...state.typingChannels,
        [channelId]: { isTyping, timestamp: Date.now() },
      },
    })),
}));
