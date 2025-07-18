import { Users, Activity, Play, Settings } from "lucide-react";

import { calculateAgentStats } from "./agent-dashboard-stats-calculator";
import { StatsCard } from "./agent-dashboard-stats-card";

import type { AgentDto as Agent } from "../../../../shared/types/domains/agents/agent.types";

interface AgentDashboardStatsProps {
  agents: Agent[];
}

export function AgentDashboardStats({ agents }: AgentDashboardStatsProps) {
  const stats = calculateAgentStats(agents);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total de Agentes"
        value={stats.totalAgents}
        Icon={Users}
      />
      <StatsCard
        title="Online"
        value={stats.onlineAgents}
        Icon={Activity}
        className="text-green-600"
      />
      <StatsCard
        title="Executando"
        value={stats.executingAgents}
        Icon={Play}
        className="text-blue-600"
      />
      <StatsCard
        title="Tipos Únicos"
        value={stats.uniqueTypes}
        Icon={Settings}
      />
    </div>
  );
}
