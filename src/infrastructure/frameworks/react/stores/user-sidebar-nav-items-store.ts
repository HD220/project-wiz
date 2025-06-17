import { create } from 'zustand';
import { UserSidebarNavItemPlaceholder, placeholderUserSidebarNavItems } from '../lib/placeholders';

interface UserSidebarNavItemsState {
  navItems: UserSidebarNavItemPlaceholder[];
  isLoading: boolean;
  fetchUserSidebarNavItems: () => Promise<void>;
}

export const useUserSidebarNavItemsStore = create<UserSidebarNavItemsState>((set) => ({
  navItems: [],
  isLoading: false,
  fetchUserSidebarNavItems: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ navItems: placeholderUserSidebarNavItems, isLoading: false });
  },
}));
