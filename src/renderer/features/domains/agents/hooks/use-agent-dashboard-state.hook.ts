import { useMemo, useState } from "react";

import type { AgentDto } from "@/shared/types/agents/agent.types";

import { useAgents } from "./use-agents.hook";

export function useAgentDashboardState() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentDto | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { agents, isLoading, error } = useAgents();

  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    return agents.filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.goal.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterStatus === "all" || agent.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [agents, searchQuery, filterStatus]);

  const handleAgentAction = (action: string, agent: AgentDto) => {
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
    allAgents: agents || [],
    handleAgentAction,
    isLoading,
    error,
  };
}
