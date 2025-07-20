import { create } from "zustand";
import { persist } from "zustand/middleware";

// Local type definitions to avoid boundary violations
type ProviderType = "openai" | "deepseek" | "anthropic";

interface SelectLlmProvider {
  id: string;
  userId: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateProviderInput {
  userId: string;
  name: string;
  type: ProviderType;
  apiKey: string;
  baseUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
}

interface LlmProviderState {
  // State
  providers: SelectLlmProvider[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createProvider: (input: CreateProviderInput) => Promise<void>;
  loadProviders: (userId: string) => Promise<void>;
  updateProvider: (
    id: string,
    updates: Partial<CreateProviderInput>,
  ) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  setAsDefault: (providerId: string, userId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Computed selectors
  getActiveProviders: () => SelectLlmProvider[];
  getDefaultProvider: () => SelectLlmProvider | undefined;
}

export const useLlmProviderStore = create<LlmProviderState>()(
  persist(
    (set, get) => ({
      // Initial state
      providers: [],
      isLoading: false,
      error: null,

      // Create a new provider
      createProvider: async (input: CreateProviderInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.create(input);

          if (response.success && response.data) {
            // Refresh the list to get updated data with proper sorting
            await get().loadProviders(input.userId);
          } else {
            throw new Error(response.error || "Failed to create provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to create provider",
          });
          throw error;
        }
      },

      // Load providers for a user
      loadProviders: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.list(userId);

          if (response.success) {
            // Transform dates from IPC response
            const providers = (response.data as SelectLlmProvider[]) || [];
            const transformedProviders = providers.map((provider) => ({
              ...provider,
              createdAt: new Date(provider.createdAt),
              updatedAt: new Date(provider.updatedAt),
            }));

            set({
              providers: transformedProviders,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to load providers");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to load providers",
          });
        }
      },

      // Update a provider
      updateProvider: async (
        id: string,
        updates: Partial<CreateProviderInput>,
      ) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.update(id, updates);

          if (response.success && response.data) {
            // Update the provider in the list
            set((state) => ({
              providers: state.providers.map((provider) =>
                provider.id === id
                  ? (response.data as SelectLlmProvider)
                  : provider,
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(response.error || "Failed to update provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update provider",
          });
          throw error;
        }
      },

      // Delete a provider
      deleteProvider: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.delete(id);

          if (response.success) {
            // Remove the provider from the list
            set((state) => ({
              providers: state.providers.filter(
                (provider) => provider.id !== id,
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(response.error || "Failed to delete provider");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete provider",
          });
          throw error;
        }
      },

      // Set a provider as default
      setAsDefault: async (providerId: string, userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.llmProviders.setDefault(
            providerId,
            userId,
          );

          if (response.success) {
            // Update all providers to reflect the new default
            set((state) => ({
              providers: state.providers.map((provider) => ({
                ...provider,
                isDefault: provider.id === providerId,
              })),
              isLoading: false,
            }));
          } else {
            throw new Error(
              response.error || "Failed to set provider as default",
            );
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to set provider as default",
          });
          throw error;
        }
      },

      // Clear error state
      clearError: () => {
        set({ error: null });
      },

      // Reset store to initial state
      reset: () => {
        set({
          providers: [],
          isLoading: false,
          error: null,
        });
      },

      // Get active providers
      getActiveProviders: (): SelectLlmProvider[] => {
        const state = get();
        return state.providers.filter(
          (provider: SelectLlmProvider) => provider.isActive,
        );
      },

      // Get default provider
      getDefaultProvider: (): SelectLlmProvider | undefined => {
        const state = get();
        return state.providers.find(
          (provider: SelectLlmProvider) =>
            provider.isDefault && provider.isActive,
        );
      },
    }),
    {
      name: "llm-provider-storage",
      // Only persist providers list, not loading/error states
      partialize: (state) => ({ providers: state.providers }),
    },
  ),
);
