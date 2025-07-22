import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AgentAPI } from "./agent.api";

import type {
  SelectAgent,
  CreateAgentInput,
  AgentStatus,
  AgentFilters,
} from "./agent.types";

interface AgentState {
  // State
  agents: SelectAgent[];
  selectedAgent: SelectAgent | null;
  isLoading: boolean;
  error: string | null;
  filters: AgentFilters;

  // Actions
  loadAgents: () => Promise<void>;
  createAgent: (input: CreateAgentInput) => Promise<boolean>;
  getAgent: (id: string) => Promise<void>;
  updateAgent: (
    id: string,
    updates: Partial<CreateAgentInput>,
  ) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  updateAgentStatus: (id: string, status: AgentStatus) => Promise<boolean>;
  setFilters: (filters: Partial<AgentFilters>) => void;
  clearError: () => void;
  clearSelectedAgent: () => void;

  // Computed
  filteredAgents: () => SelectAgent[];
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      // Initial state
      agents: [],
      selectedAgent: null,
      isLoading: false,
      error: null,
      filters: {},

      // Actions
      loadAgents: async () => {
        set({ isLoading: true, error: null });
        try {
          const agents = await AgentAPI.list();
          set({ agents, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load agents",
            isLoading: false,
          });
        }
      },

      createAgent: async (input: CreateAgentInput) => {
        set({ isLoading: true, error: null });
        try {
          const newAgent = await AgentAPI.create(input);
          set((state) => ({
            agents: [newAgent, ...state.agents],
            isLoading: false,
          }));
          return true;
        } catch (error) {
          console.error("Error creating agent:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to create agent",
            isLoading: false,
          });
          return false;
        }
      },

      getAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const agent = await AgentAPI.getById(id);
          set({ selectedAgent: agent, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to get agent",
            isLoading: false,
          });
        }
      },

      updateAgent: async (id: string, updates: Partial<CreateAgentInput>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedAgent = await AgentAPI.update(id, updates);
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === id ? updatedAgent : agent,
            ),
            selectedAgent:
              state.selectedAgent?.id === id
                ? updatedAgent
                : state.selectedAgent,
            isLoading: false,
          }));
          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to update agent",
            isLoading: false,
          });
          return false;
        }
      },

      deleteAgent: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await AgentAPI.delete(id);
          set((state) => ({
            agents: state.agents.filter((agent) => agent.id !== id),
            selectedAgent:
              state.selectedAgent?.id === id ? null : state.selectedAgent,
            isLoading: false,
          }));
          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete agent",
            isLoading: false,
          });
          return false;
        }
      },

      updateAgentStatus: async (id: string, status: AgentStatus) => {
        try {
          await AgentAPI.updateStatus(id, status);
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === id ? { ...agent, status } : agent,
            ),
            selectedAgent:
              state.selectedAgent?.id === id
                ? { ...state.selectedAgent, status }
                : state.selectedAgent,
          }));
          return true;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update agent status",
          });
          return false;
        }
      },

      setFilters: (filters: Partial<AgentFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearError: () => set({ error: null }),

      clearSelectedAgent: () => set({ selectedAgent: null }),

      // Computed
      filteredAgents: () => {
        const { agents, filters } = get();
        let filtered = [...agents];

        if (filters.status) {
          filtered = filtered.filter(
            (agent) => agent.status === filters.status,
          );
        }

        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (agent) =>
              agent.name.toLowerCase().includes(search) ||
              agent.role.toLowerCase().includes(search),
          );
        }

        return filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      },
    }),
    {
      name: "agent-storage",
      partialize: (state) => ({
        agents: state.agents,
        filters: state.filters,
      }),
    },
  ),
);
