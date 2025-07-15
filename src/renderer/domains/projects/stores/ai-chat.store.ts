import { create } from 'zustand';
import type { ChannelMessageDto } from '../../../../shared/types/domains/projects/channel-message.types';

interface AiChatState {
  optimisticMessages: ChannelMessageDto[];
  addOptimisticMessage: (message: ChannelMessageDto) => void;
  clearOptimisticMessages: () => void;
}

export const useAiChatStore = create<AiChatState>((set) => ({
  optimisticMessages: [],
  addOptimisticMessage: (message) =>
    set((state) => ({
      optimisticMessages: [...state.optimisticMessages, message],
    })),
  clearOptimisticMessages: () => set({ optimisticMessages: [] }),
}));