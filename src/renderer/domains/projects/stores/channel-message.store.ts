import { create } from 'zustand';
import type { ChannelMessageDto } from '../../../../shared/types/domains/projects/channel-message.types';

interface ChannelMessageState {
  selectedMessage: ChannelMessageDto | null;
  setSelectedMessage: (message: ChannelMessageDto | null) => void;
}

export const useChannelMessageStore = create<ChannelMessageState>((set) => ({
  selectedMessage: null,
  setSelectedMessage: (message) => set({ selectedMessage: message }),
}));