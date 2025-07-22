import { useCallback } from "react";

import { useAgentStore } from "./agent.store";

import type { AgentStatus } from "./agent.types";

export function useAgent() {
  const {
    agents,
    selectedAgent,
    isLoading,
    error,
    filteredAgents,
    loadAgents,
    getAgent,
    clearError,
    clearSelectedAgent,
  } = useAgentStore();

  return {
    agents,
    selectedAgent,
    isLoading,
    error,
    filteredAgents: filteredAgents(),
    loadAgents,
    getAgent,
    clearError,
    clearSelectedAgent,
  };
}

export function useAgentActions() {
  const {
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    isLoading,
    error,
  } = useAgentStore();

  const toggleAgentStatus = useCallback(
    async (id: string, currentStatus: AgentStatus) => {
      const newStatus: AgentStatus =
        currentStatus === "active" ? "inactive" : "active";
      return await updateAgentStatus(id, newStatus);
    },
    [updateAgentStatus],
  );

  return {
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    toggleAgentStatus,
    isLoading,
    error,
  };
}

export function useAgentFilters() {
  const { filters, setFilters } = useAgentStore();

  const setStatusFilter = useCallback(
    (status: AgentStatus | undefined) => {
      setFilters({ status });
    },
    [setFilters],
  );

  const setSearchFilter = useCallback(
    (search: string) => {
      setFilters({ search: search.trim() || undefined });
    },
    [setFilters],
  );

  const clearFilters = useCallback(() => {
    setFilters({ status: undefined, search: undefined });
  }, [setFilters]);

  return {
    filters,
    setStatusFilter,
    setSearchFilter,
    clearFilters,
  };
}
