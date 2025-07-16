import { ScrollArea } from "../../../components/ui/scroll-area";

import { AgentsList } from "./agents-list";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsPanelProps {
  agents: AgentDto[];
  isOpen: boolean;
  onAgentSelect: (agentId: string) => void;
}

export function AgentsPanel({
  agents,
  isOpen,
  onAgentSelect,
}: AgentsPanelProps) {
  if (!isOpen) return null;

  const onlineAgents = agents.filter((a) => a.status !== "offline");
  const offlineAgents = agents.filter((a) => a.status === "offline");

  return (
    <div className="w-60 bg-card border-l border-border hidden xl:flex flex-col flex-none">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          <AgentsList
            agents={onlineAgents}
            title="Online"
            onAgentSelect={onAgentSelect}
          />
          <AgentsList
            agents={offlineAgents}
            title="Offline"
            onAgentSelect={onAgentSelect}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
