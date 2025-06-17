import { create } from 'zustand';
import { ProjectChannelPlaceholder, placeholderProjectChannels } from '../lib/placeholders';

interface ProjectChannelsState {
  channels: ProjectChannelPlaceholder[];
  isLoading: boolean;
  currentProjectId: string | null;
  fetchProjectChannels: (projectId: string) => Promise<void>;
}

export const useProjectChannelsStore = create<ProjectChannelsState>((set) => ({
  channels: [],
  isLoading: false,
  currentProjectId: null,
  fetchProjectChannels: async (projectId: string) => {
    set({ isLoading: true, currentProjectId: projectId, channels: [] });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    // In a real application, you would fetch channels specific to the projectId
    set({ channels: placeholderProjectChannels, isLoading: false });
  },
}));
