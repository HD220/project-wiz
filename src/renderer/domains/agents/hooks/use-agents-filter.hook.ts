import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface UseAgentsFilterProps {
  agents: AgentDto[];
  searchQuery: string;
}

export function useAgentsFilter({ agents, searchQuery }: UseAgentsFilterProps) {
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.goal.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return { filteredAgents };
}
