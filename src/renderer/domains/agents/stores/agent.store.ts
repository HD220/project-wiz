import { create } from "zustand";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentState {
  selectedAgent: AgentDto | null;
  setSelectedAgent: (agent: AgentDto | null) => void;
}

export const useAgentStore = create<AgentState>((set: any) => ({
  selectedAgent: null,
  setSelectedAgent: (agent: AgentDto | null) => set({ selectedAgent: agent }),
}));
