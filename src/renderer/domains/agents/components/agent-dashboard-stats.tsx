import { Users, Activity, Play, Settings } from "lucide-react";

import { calculateAgentStats } from "./agent-dashboard-stats-calculator";
import { StatsCard } from "./agent-dashboard-stats-card";

import type { Agent } from "../../../../lib/placeholders";

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
        icon={Users}
      />
      <StatsCard
        title="Online"
        value={stats.onlineAgents}
        icon={Activity}
        className="text-green-600"
      />
      <StatsCard
        title="Executando"
        value={stats.executingAgents}
        icon={Play}
        className="text-blue-600"
      />
      <StatsCard
        title="Tipos Únicos"
        value={stats.uniqueTypes}
        icon={Settings}
      />
    </div>
  );
}
