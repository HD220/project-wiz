import { create } from "zustand";

interface UserUIState {
  showUserProfile: boolean;
  showSettings: boolean;
  selectedSection: string;
}

interface UserUIActions {
  setShowUserProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setSelectedSection: (section: string) => void;
  reset: () => void;
}

const initialState: UserUIState = {
  showUserProfile: false,
  showSettings: false,
  selectedSection: "general",
};

export const useUserStore = create<UserUIState & UserUIActions>((set) => ({
  ...initialState,

  setShowUserProfile: (show) => set({ showUserProfile: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setSelectedSection: (section) => set({ selectedSection: section }),

  reset: () => set(initialState),
}));
