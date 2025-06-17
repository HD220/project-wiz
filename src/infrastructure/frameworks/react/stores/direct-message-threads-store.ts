import { create } from 'zustand';
import { DirectMessageThreadPlaceholder, placeholderDirectMessageThreads } from '../lib/placeholders';

interface DirectMessageThreadsState {
  threads: DirectMessageThreadPlaceholder[];
  isLoading: boolean;
  fetchDirectMessageThreads: () => Promise<void>;
}

export const useDirectMessageThreadsStore = create<DirectMessageThreadsState>((set) => ({
  threads: [],
  isLoading: false,
  fetchDirectMessageThreads: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ threads: placeholderDirectMessageThreads, isLoading: false });
  },
}));
