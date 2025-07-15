import { useState } from "react";

import { useAgents } from "../hooks/use-agents.hook";
import { AddAgentModal } from "./add-agent-modal";
import { AgentsSidebarError } from "./agents-sidebar-error";
import { AgentsSidebarHeader } from "./agents-sidebar-header";
import { AgentsSidebarList } from "./agents-sidebar-list";
import { AgentsSidebarSearch } from "./agents-sidebar-search";
import { AgentsSidebarStats } from "./agents-sidebar-stats";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsSidebarProps {
  isOpen: boolean;
  onAgentSelect?: (agent: AgentDto) => void;
  projectId?: string;
}

export function AgentsSidebar({
  isOpen,
  onAgentSelect,
  projectId,
}: AgentsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { activeAgents, isLoading, error, deleteAgent } = useAgents();

  const filteredAgents = activeAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.goal.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full min-w-0 overflow-hidden">
      <AgentsSidebarHeader
        projectId={projectId}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AgentsSidebarStats
        totalAgents={activeAgents.length}
        filteredAgents={filteredAgents.length}
      />

      <AgentsSidebarSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {error && (
        <AgentsSidebarError
          error={error}
          onClearError={() => {/* clearError functionality to be implemented */}}
        />
      )}

      <AgentsSidebarList
        agents={filteredAgents}
        isLoading={isLoading}
        searchQuery={searchQuery}
        projectId={projectId}
        onRemoveAgent={handleRemoveAgent}
        onAddAgent={() => setIsAddModalOpen(true)}
        onAgentSelect={onAgentSelect}
      />

      <AddAgentModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        projectId={projectId}
        onAgentAdded={handleAgentAdded}
      />
    </div>
  );
}
