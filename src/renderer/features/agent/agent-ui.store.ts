import { create } from "zustand";

import type {
  SelectAgent,
  AgentFilters,
} from "@/renderer/features/agent/agent.types";

interface AgentUIState {
  // Pure UI state only - no server state
  selectedAgent: SelectAgent | null;
  filters: AgentFilters;

  // UI actions only
  setSelectedAgent: (agent: SelectAgent | null) => void;
  clearSelectedAgent: () => void;
  setFilters: (filters: Partial<AgentFilters>) => void;
  clearFilters: () => void;
}

export const useAgentUIStore = create<AgentUIState>((set) => ({
  // Initial UI state
  selectedAgent: null,
  filters: {},

  // Set selected agent (UI state)
  setSelectedAgent: (agent: SelectAgent | null) => {
    set({ selectedAgent: agent });
  },

  // Clear selected agent
  clearSelectedAgent: () => {
    set({ selectedAgent: null });
  },

  // Set filters (UI state)
  setFilters: (filters: Partial<AgentFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: {} });
  },
}));
