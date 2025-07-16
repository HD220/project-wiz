import type { Agent } from "../../../lib/placeholders";

export function calculateAgentStats(agents: Agent[]) {
  return {
    totalAgents: agents.length,
    onlineAgents: agents.filter((a) => a.status !== "offline").length,
    executingAgents: agents.filter((a) => a.isExecuting).length,
    uniqueTypes: new Set(agents.map((a) => a.type)).size,
  };
}
