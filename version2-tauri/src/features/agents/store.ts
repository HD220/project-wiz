import { create } from 'zustand';
import { api } from '@/lib/tauri-api';
import type { Agent, CreateAgentInput, UpdateAgentInput } from '@/lib/types';

type AgentsState = {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
};

type AgentsActions = {
  fetchAgents: (token: string) => Promise<void>;
  createAgent: (input: CreateAgentInput, token: string) => Promise<Agent>;
  updateAgent: (input: UpdateAgentInput, token: string) => Promise<Agent>;
  deleteAgent: (id: string, token: string) => Promise<void>;
  clearError: () => void;
};

type AgentsStore = AgentsState & AgentsActions;

export const useAgentsStore = create<AgentsStore>((set) => ({
  // State
  agents: [],
  isLoading: false,
  error: null,

  // Actions
  fetchAgents: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const agents = await api.agents.list(token);
      set({ agents, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch agents', isLoading: false });
      throw error;
    }
  },

  createAgent: async (input: CreateAgentInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const agent = await api.agents.create(input, token);
      set((state) => ({
        agents: [...state.agents, agent],
        isLoading: false
      }));
      return agent;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create agent', isLoading: false });
      throw error;
    }
  },

  updateAgent: async (input: UpdateAgentInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedAgent = await api.agents.update(input, token);
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.user.id === input.id ? updatedAgent : agent
        ),
        isLoading: false,
      }));
      return updatedAgent;
    } catch (error: any) {
      set({ error: error.message || 'Failed to update agent', isLoading: false });
      throw error;
    }
  },

  deleteAgent: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.agents.delete(id, token);
      set((state) => ({
        agents: state.agents.filter((agent) => agent.user.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete agent', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
