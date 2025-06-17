import { create } from 'zustand';
import { ProjectNavItemPlaceholder, placeholderProjectNavItems } from '../lib/placeholders';

interface ProjectNavItemsState {
  navItems: ProjectNavItemPlaceholder[];
  isLoading: boolean;
  currentProjectId: string | null;
  fetchProjectNavItems: (projectId: string) => Promise<void>;
}

export const useProjectNavItemsStore = create<ProjectNavItemsState>((set) => ({
  navItems: [],
  isLoading: false,
  currentProjectId: null,
  fetchProjectNavItems: async (projectId: string) => {
    set({ isLoading: true, currentProjectId: projectId, navItems: [] });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    // In a real application, you would fetch navItems specific to the projectId
    set({ navItems: placeholderProjectNavItems, isLoading: false });
  },
}));
