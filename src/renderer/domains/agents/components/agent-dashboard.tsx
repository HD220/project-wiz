import { ScrollArea } from '@/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAgentDashboardState } from "../hooks/use-agent-dashboard-state.hook";

import { AgentDashboardHeader } from "./agent-dashboard-header";
import { AgentDashboardStats } from "./agent-dashboard-stats";

interface AgentDashboardProps {
  className?: string;
}

export function AgentDashboard({ className }: AgentDashboardProps) {
  const state = useAgentDashboardState();

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        <AgentDashboardHeader />
        <AgentDashboardStats agents={state.allAgents} />

        {/* TODO: Adicionar componentes restantes conforme necessário */}
        <div className="text-center text-muted-foreground py-8">
          Dashboard em desenvolvimento - componentes principais implementados
        </div>
      </div>
    </ScrollArea>
  );
}
