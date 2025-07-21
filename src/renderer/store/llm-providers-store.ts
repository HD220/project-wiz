import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";
import type { CreateProviderInput } from "@/features/llm-providers/types";

// Local type definitions to avoid boundary violations
interface LLMProvider {
  id: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string; // Will be masked in UI
  baseUrl?: string;
  defaultModel: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


// Helper function to get current user ID
const getCurrentUserId = (): string => {
  const authState = useAuthStore.getState();
  if (!authState.user?.id) {
    throw new Error("User not authenticated");
  }
  return authState.user.id;
};

interface UpdateProviderInput {
  name?: string;
  type?: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface TestApiKeyInput {
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string;
}

interface LLMProvidersState {
  // State
  providers: LLMProvider[];
  defaultProvider: LLMProvider | null;
  isLoading: boolean;
  error: string | null;
  testingProvider: string | null; // ID of provider being tested

  // Actions
  loadProviders: () => Promise<void>;
  createProvider: (data: CreateProviderInput) => Promise<void>;
  updateProvider: (id: string, data: UpdateProviderInput) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  setDefaultProvider: (id: string) => Promise<void>;
  testProvider: (data: TestApiKeyInput) => Promise<boolean>;
  clearError: () => void;
}

export const useLLMProvidersStore = create<LLMProvidersState>()(
  persist(
    (set, get) => ({
      // Initial state
      providers: [],
      defaultProvider: null,
      isLoading: false,
      error: null,
      testingProvider: null,

      // Load all providers for current user
      loadProviders: async () => {
        set({ isLoading: true, error: null });

        try {
          const userId = getCurrentUserId();
          const response = await window.api.llmProviders.list(userId);

          if (response.success && response.data) {
            const providers = response.data as LLMProvider[];
            const defaultProvider = providers.find(p => p.isDefault) || null;

            set({
              providers,
              defaultProvider,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to load providers");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to load providers",
          });
          throw error;
        }
      },

      // Create new provider
      createProvider: async (data: CreateProviderInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.create(data);

          if (response.success && response.data) {
            const newProvider = response.data as LLMProvider;
            const currentProviders = get().providers;

            set({
              providers: [...currentProviders, newProvider],
              defaultProvider: newProvider.isDefault ? newProvider : get().defaultProvider,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to create provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to create provider",
          });
          throw error;
        }
      },

      // Update existing provider
      updateProvider: async (id: string, data: UpdateProviderInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.update(id, data);

          if (response.success && response.data) {
            const updatedProvider = response.data as LLMProvider;
            const currentProviders = get().providers;

            const updatedProviders = currentProviders.map(p => 
              p.id === id ? updatedProvider : p
            );

            set({
              providers: updatedProviders,
              defaultProvider: updatedProvider.isDefault ? updatedProvider : get().defaultProvider,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to update provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to update provider",
          });
          throw error;
        }
      },

      // Delete provider
      deleteProvider: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.delete(id);

          if (response.success) {
            const currentProviders = get().providers;
            const currentDefault = get().defaultProvider;

            const updatedProviders = currentProviders.filter(p => p.id !== id);
            const newDefaultProvider = currentDefault?.id === id ? null : currentDefault;

            set({
              providers: updatedProviders,
              defaultProvider: newDefaultProvider,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to delete provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to delete provider",
          });
          throw error;
        }
      },

      // Set provider as default
      setDefaultProvider: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const userId = getCurrentUserId();
          const response = await window.api.llmProviders.setDefault(id, userId);

          if (response.success && response.data) {
            const updatedProvider = response.data as LLMProvider;
            const currentProviders = get().providers;

            // Update all providers - set the new default and unset others
            const updatedProviders = currentProviders.map(p => ({
              ...p,
              isDefault: p.id === id
            }));

            set({
              providers: updatedProviders,
              defaultProvider: updatedProvider,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to set default provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Failed to set default provider",
          });
          throw error;
        }
      },

      // Test provider API key
      testProvider: async (data: TestApiKeyInput): Promise<boolean> => {
        set({ testingProvider: "test", error: null });

        try {
          const response = await window.api.llmProviders.testApiKey(data);

          if (response.success && response.data) {
            set({ testingProvider: null });
            return response.data as boolean;
          } else {
            throw new Error(response.error || "Failed to test API key");
          }
        } catch (error) {
          set({
            testingProvider: null,
            error: error instanceof Error ? error.message : "Failed to test API key",
          });
          return false;
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "llm-providers-storage",
      // Only persist providers and defaultProvider, not loading/error states
      partialize: (state) => ({
        providers: state.providers,
        defaultProvider: state.defaultProvider,
      }),
    },
  ),
);