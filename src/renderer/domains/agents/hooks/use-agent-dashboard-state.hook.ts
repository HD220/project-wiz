import { useState } from "react";

import { mockAgents, type Agent } from "../../../../lib/placeholders";

export function useAgentDashboardState() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || agent.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAgentAction = (action: string, agent: Agent) => {
    console.log(`${action} action for agent:`, agent.id);
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedAgent,
    setSelectedAgent,
    filterStatus,
    setFilterStatus,
    filteredAgents,
    allAgents: mockAgents,
    handleAgentAction,
  };
}
