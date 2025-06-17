import { create } from 'zustand';
import { AppSidebarProjectPlaceholder, placeholderAppSidebarProjects } from '../lib/placeholders';

interface AppSidebarProjectsState {
  projects: AppSidebarProjectPlaceholder[];
  isLoading: boolean;
  fetchAppSidebarProjects: () => Promise<void>;
}

export const useAppSidebarProjectsStore = create<AppSidebarProjectsState>((set) => ({
  projects: [],
  isLoading: false,
  fetchAppSidebarProjects: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ projects: placeholderAppSidebarProjects, isLoading: false });
  },
}));
