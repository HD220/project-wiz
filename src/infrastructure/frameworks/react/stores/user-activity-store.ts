import { create } from 'zustand';
import { PlaceholderActivity, placeholderUserActivity } from '../lib/placeholders';

interface UserActivityState {
  activities: PlaceholderActivity[];
  isLoading: boolean;
  fetchUserActivities: () => Promise<void>;
}

export const useUserActivityStore = create<UserActivityState>((set) => ({
  activities: [],
  isLoading: false,
  fetchUserActivities: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ activities: placeholderUserActivity, isLoading: false });
  },
}));
