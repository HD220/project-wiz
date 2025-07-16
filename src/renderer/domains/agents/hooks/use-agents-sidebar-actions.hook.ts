import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface UseAgentsSidebarActionsProps {
  deleteAgent: (agentId: string) => Promise<void>;
  onAgentSelect?: (agent: AgentDto) => void;
}

export function useAgentsSidebarActions({
  deleteAgent,
  onAgentSelect,
}: UseAgentsSidebarActionsProps) {
  const handleRemoveAgent = async (agentId: string) => {
    try {
      await deleteAgent(agentId);
    } catch (error) {
      console.error("Failed to remove agent:", error);
    }
  };

  const handleAgentAdded = (agent: AgentDto) => {
    onAgentSelect?.(agent);
  };

  return {
    handleRemoveAgent,
    handleAgentAdded,
  };
}