import { create } from 'zustand';
import { api } from '@/lib/tauri-api';
import type {
  LlmProvider,
  CreateProviderInput,
  UpdateProviderInput,
  UpdateProviderApiKeyInput,
} from '@/lib/types';

type ProvidersState = {
  providers: LlmProvider[];
  isLoading: boolean;
  error: string | null;
};

type ProvidersActions = {
  fetchProviders: (token: string) => Promise<void>;
  createProvider: (input: CreateProviderInput, token: string) => Promise<LlmProvider>;
  updateProvider: (input: UpdateProviderInput, token: string) => Promise<LlmProvider>;
  updateProviderApiKey: (input: UpdateProviderApiKeyInput, token: string) => Promise<void>;
  deleteProvider: (id: string, token: string) => Promise<void>;
  clearError: () => void;
};

type ProvidersStore = ProvidersState & ProvidersActions;

export const useProvidersStore = create<ProvidersStore>((set) => ({
  // State
  providers: [],
  isLoading: false,
  error: null,

  // Actions
  fetchProviders: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const providers = await api.providers.list(token);
      set({ providers, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch providers',
        isLoading: false,
      });
      throw error;
    }
  },

  createProvider: async (input: CreateProviderInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const provider = await api.providers.create(input, token);
      set((state) => ({
        providers: [...state.providers, provider],
        isLoading: false,
      }));
      return provider;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create provider',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProvider: async (input: UpdateProviderInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProvider = await api.providers.update(input, token);
      set((state) => ({
        providers: state.providers.map((provider) =>
          provider.id === input.id ? updatedProvider : provider
        ),
        isLoading: false,
      }));
      return updatedProvider;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update provider',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProviderApiKey: async (input: UpdateProviderApiKeyInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.providers.updateApiKey(input, token);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update API key',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProvider: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.providers.delete(id, token);
      set((state) => ({
        providers: state.providers.filter((provider) => provider.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete provider',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
