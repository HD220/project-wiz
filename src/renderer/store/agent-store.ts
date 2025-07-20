import { create } from "zustand";
import { persist } from "zustand/middleware";

// Local type definitions to avoid boundary violations
type AgentStatus = "active" | "inactive" | "busy";

interface SelectAgent {
  id: string;
  userId: string;
  providerId: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  systemPrompt: string;
  status: AgentStatus;
  modelConfig: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateAgentInput {
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: string;
  status: AgentStatus;
  avatar?: string;
}

interface AgentState {
  // State
  agents: SelectAgent[];
  isLoading: boolean;
  error: string | null;

  // Actions
  createAgent: (input: CreateAgentInput) => Promise<void>;
  loadAgents: () => Promise<void>;
  updateAgent: (
    id: string,
    updates: Partial<CreateAgentInput>,
  ) => Promise<void>;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;

  // Computed selectors
  getActiveAgents: () => SelectAgent[];
  getAgentsByStatus: (status: AgentStatus) => SelectAgent[];
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      isLoading: false,
      error: null,

      // Create a new agent
      createAgent: async (input: CreateAgentInput) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.agents.create(input);

          if (response.success && response.data) {
            // Refresh the list to get updated data with proper sorting
            await get().loadAgents();
          } else {
            throw new Error(response.error || "Failed to create agent");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to create agent",
          });
          throw error;
        }
      },

      // Load all agents
      loadAgents: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.agents.list();

          if (response.success) {
            set({
              agents: (response.data as SelectAgent[]) || [],
              isLoading: false,
            });
          } else {
            throw new Error(response.error || "Failed to load agents");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to load agents",
          });
        }
      },

      // Update an agent
      updateAgent: async (id: string, updates: Partial<CreateAgentInput>) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.agents.update(id, updates);

          if (response.success && response.data) {
            // Update the agent in the list
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id ? (response.data as SelectAgent) : agent,
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(response.error || "Failed to update agent");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to update agent",
          });
          throw error;
        }
      },

      // Update agent status only
      updateAgentStatus: async (id: string, status: AgentStatus) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.agents.updateStatus(id, status);

          if (response.success) {
            // Update the agent status in the list
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id
                  ? { ...agent, status, updatedAt: new Date() }
                  : agent,
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(response.error || "Failed to update agent status");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to update agent status",
          });
          throw error;
        }
      },

      // Delete an agent
      deleteAgent: async (id: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await window.api.agents.delete(id);

          if (response.success) {
            // Remove the agent from the list and reload from server to ensure sync
            set((state) => ({
              agents: state.agents.filter((agent) => agent.id !== id),
              isLoading: false,
            }));
            
            // Reload the agents list to ensure data consistency
            await get().loadAgents();
          } else {
            throw new Error(response.error || "Failed to delete agent");
          }
        } catch (error) {
          set({
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Failed to delete agent",
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
          agents: [],
          isLoading: false,
          error: null,
        });
      },

      // Get active agents
      getActiveAgents: (): SelectAgent[] => {
        const state = get();
        return state.agents.filter(
          (agent: SelectAgent) => agent.status === "active",
        );
      },

      // Get agents by status
      getAgentsByStatus: (status: AgentStatus): SelectAgent[] => {
        const state = get();
        return state.agents.filter(
          (agent: SelectAgent) => agent.status === status,
        );
      },
    }),
    {
      name: "agent-storage",
      // Only persist agents list, not loading/error states
      partialize: (state) => ({ agents: state.agents }),
    },
  ),
);
