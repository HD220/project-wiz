import { create } from 'zustand';
import type { Agent, CreateAgentInput } from '../../shared/types/common';
import { ApiClient } from '../utils/api-client';

interface AgentState {
  // State
  agents: Agent[];
  availableAgents: Agent[];
  currentAgent: Agent | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserAgents: (userId: string) => Promise<void>;
  loadAvailableAgents: (userId: string) => Promise<void>;
  createAgent: (input: CreateAgentInput) => Promise<Agent>;
  updateAgent: (agentId: string, input: Partial<CreateAgentInput>, userId: string) => Promise<void>;
  updateAgentStatus: (agentId: string, status: string) => Promise<void>;
  deleteAgent: (agentId: string, userId: string) => Promise<void>;
  setCurrentAgent: (agent: Agent | null) => void;
  loadCurrentAgent: (agentId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  agents: [],
  availableAgents: [],
  currentAgent: null,
  isLoading: false,
  error: null,

  // Actions
  loadUserAgents: async (userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const agents = await ApiClient.findAgentsByCreator(userId);
      set({ agents, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load agents',
      });
    }
  },

  loadAvailableAgents: async (userId: string) => {
    try {
      const agents = await ApiClient.getAvailableAgents(userId);
      set({ availableAgents: agents });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load available agents',
      });
    }
  },

  createAgent: async (input: CreateAgentInput): Promise<Agent> => {
    set({ isLoading: true, error: null });
    
    try {
      const newAgent = await ApiClient.createAgent(input);
      
      set((state) => ({
        agents: [newAgent, ...state.agents],
        availableAgents: [newAgent, ...state.availableAgents],
        isLoading: false,
      }));
      
      return newAgent;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create agent',
      });
      throw error;
    }
  },

  updateAgent: async (agentId: string, input: Partial<CreateAgentInput>, userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedAgent = await ApiClient.updateAgent({ agentId, input, userId });
      
      set((state) => ({
        agents: state.agents.map(a => a.id === agentId ? updatedAgent : a),
        availableAgents: state.availableAgents.map(a => a.id === agentId ? updatedAgent : a),
        currentAgent: state.currentAgent?.id === agentId ? updatedAgent : state.currentAgent,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update agent',
      });
      throw error;
    }
  },

  updateAgentStatus: async (agentId: string, status: string) => {
    try {
      await window.electronAPI.updateAgentStatus({ agentId, status });
      
      set((state) => ({
        agents: state.agents.map(a => 
          a.id === agentId ? { ...a, status } : a
        ),
        availableAgents: state.availableAgents.map(a => 
          a.id === agentId ? { ...a, status } : a
        ),
        currentAgent: state.currentAgent?.id === agentId 
          ? { ...state.currentAgent, status } 
          : state.currentAgent,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update agent status',
      });
      throw error;
    }
  },

  deleteAgent: async (agentId: string, userId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await ApiClient.deleteAgent({ agentId, userId });
      
      set((state) => ({
        agents: state.agents.filter(a => a.id !== agentId),
        availableAgents: state.availableAgents.filter(a => a.id !== agentId),
        currentAgent: state.currentAgent?.id === agentId ? null : state.currentAgent,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete agent',
      });
      throw error;
    }
  },

  setCurrentAgent: (agent: Agent | null) => {
    set({ currentAgent: agent });
  },

  loadCurrentAgent: async (agentId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const agent = await window.electronAPI.findAgentById(agentId);
      
      if (agent.success && agent.data) {
        set({ currentAgent: agent.data, isLoading: false });
      } else {
        set({ 
          currentAgent: null, 
          isLoading: false,
          error: 'Agent not found'
        });
      }
    } catch (error) {
      set({
        currentAgent: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load agent',
      });
    }
  },

  clearError: () => set({ error: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));