import { ScrollArea } from "@/components/ui/scroll-area";

import { AgentsSidebarAgentItem } from "./agents-sidebar-agent-item";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentListRendererProps {
  agents: AgentDto[];
  projectId?: string;
  onRemoveAgent: (agentId: string) => void;
  onAgentSelect?: (agent: AgentDto) => void;
}

export function AgentsSidebarListRenderer({
  agents,
  projectId,
  onRemoveAgent,
  onAgentSelect,
}: AgentListRendererProps) {
  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="px-1.5 py-2 space-y-0.5">
        {agents.map((agent) => (
          <AgentsSidebarAgentItem
            key={agent.id}
            agent={agent}
            projectId={projectId}
            onRemoveAgent={onRemoveAgent}
            onAgentSelect={onAgentSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
