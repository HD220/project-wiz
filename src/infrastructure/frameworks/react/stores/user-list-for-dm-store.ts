import { create } from 'zustand';
import { UserPlaceholder, placeholderUserListForDM } from '../lib/placeholders';

interface UserListForDMState {
  users: UserPlaceholder[];
  isLoading: boolean;
  fetchUserListForDM: () => Promise<void>;
}

export const useUserListForDMStore = create<UserListForDMState>((set) => ({
  users: [],
  isLoading: false,
  fetchUserListForDM: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ users: placeholderUserListForDM, isLoading: false });
  },
}));
