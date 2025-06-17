import { create } from 'zustand';
import { PlaceholderTask, PlaceholderTeamMember, getProjectDetailsPlaceholder } from '../lib/placeholders';

interface ProjectDetailsData {
  tasks: PlaceholderTask[];
  teamMembers: PlaceholderTeamMember[];
}

interface ProjectDetailsState {
  details: ProjectDetailsData | null;
  isLoading: boolean;
  currentProjectId: string | null;
  fetchProjectDetails: (projectId: string) => Promise<void>;
}

export const useProjectDetailsStore = create<ProjectDetailsState>((set) => ({
  details: null,
  isLoading: false,
  currentProjectId: null,
  fetchProjectDetails: async (projectId: string) => {
    set({ isLoading: true, currentProjectId: projectId, details: null });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    const data = getProjectDetailsPlaceholder(projectId);
    set({ details: data, isLoading: false });
  },
}));
