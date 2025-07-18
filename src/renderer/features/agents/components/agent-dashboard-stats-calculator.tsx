import type { AgentDto } from "@/shared/types/agents/agent.types";

export function calculateAgentStats(agents: AgentDto[]) {
  return {
    totalAgents: agents.length,
    onlineAgents: agents.filter((a) => a.status !== "offline").length,
    executingAgents: agents.filter((a) => a.isExecuting).length,
    activeAgents: agents.filter((a) => a.isActive).length,
    uniqueRoles: new Set(agents.map((a) => a.role)).size,
  };
}
