import { create } from "zustand";

import type { LlmProviderDto } from "../../../../shared/types/llm/llm-provider.types";

interface LlmProviderState {
  selectedLlmProvider: LlmProviderDto | null;
  setSelectedLlmProvider: (provider: LlmProviderDto | null) => void;
}

export const useLlmProviderStore = create<LlmProviderState>((set) => ({
  selectedLlmProvider: null,
  setSelectedLlmProvider: (provider: LlmProviderDto | null) =>
    set({ selectedLlmProvider: provider }),
}));
