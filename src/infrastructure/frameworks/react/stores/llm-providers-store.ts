import { create } from 'zustand';
import { LLMProviderPlaceholder, llmProvidersPlaceholder } from '../lib/placeholders';

interface LLMProvidersState {
  llmProviders: LLMProviderPlaceholder[];
  isLoading: boolean;
  fetchLLMProviders: () => Promise<void>;
}

export const useLLMProvidersStore = create<LLMProvidersState>((set) => ({
  llmProviders: [],
  isLoading: false,
  fetchLLMProviders: async () => {
    set({ isLoading: true });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async delay
    set({ llmProviders: llmProvidersPlaceholder, isLoading: false });
  },
}));
