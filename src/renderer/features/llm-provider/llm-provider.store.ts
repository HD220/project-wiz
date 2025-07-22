import { create } from "zustand";

interface LlmProviderUIState {
  showCreateDialog: boolean;
  showEditDialog: boolean;
  editingProviderId: string | null;
  isTestingConnection: boolean;
  testResults: Record<string, boolean>;
}

interface LlmProviderUIActions {
  setShowCreateDialog: (show: boolean) => void;
  setShowEditDialog: (show: boolean) => void;
  setEditingProviderId: (id: string | null) => void;
  setTestingConnection: (testing: boolean) => void;
  setTestResult: (providerId: string, result: boolean) => void;
  reset: () => void;
}

const initialState: LlmProviderUIState = {
  showCreateDialog: false,
  showEditDialog: false,
  editingProviderId: null,
  isTestingConnection: false,
  testResults: {},
};

export const useLlmProviderStore = create<
  LlmProviderUIState & LlmProviderUIActions
>((set) => ({
  ...initialState,

  setShowCreateDialog: (show) => set({ showCreateDialog: show }),
  setShowEditDialog: (show) => set({ showEditDialog: show }),
  setEditingProviderId: (id) => set({ editingProviderId: id }),
  setTestingConnection: (testing) => set({ isTestingConnection: testing }),
  setTestResult: (providerId, result) =>
    set((state) => ({
      testResults: { ...state.testResults, [providerId]: result },
    })),

  reset: () => set(initialState),
}));
