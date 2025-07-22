import { useCallback } from "react";

import { useAgentUIStore } from "@/renderer/features/agent/agent-ui.store";
import {
  useAgents,
  useAgent as useAgentQuery,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
  useUpdateAgentStatus,
} from "@/renderer/features/agent/agent.queries";
import type {
  AgentStatus,
  CreateAgentInput,
} from "@/renderer/features/agent/agent.types";

export function useAgent() {
  const uiStore = useAgentUIStore();
  const { data: agents = [], isLoading, error } = useAgents();

  // Computed filtered agents
  const filteredAgents = agents
    .filter((agent) => {
      if (uiStore.filters.status && agent.status !== uiStore.filters.status) {
        return false;
      }

      if (uiStore.filters.search) {
        const search = uiStore.filters.search.toLowerCase();
        if (
          !agent.name.toLowerCase().includes(search) &&
          !agent.role.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return {
    agents,
    selectedAgent: uiStore.selectedAgent,
    isLoading,
    error,
    filteredAgents,
    setSelectedAgent: uiStore.setSelectedAgent,
    clearSelectedAgent: uiStore.clearSelectedAgent,
  };
}

export function useAgentActions() {
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();
  const updateStatusMutation = useUpdateAgentStatus();

  const createAgent = useCallback(
    async (input: CreateAgentInput) => {
      try {
        await createAgentMutation.mutateAsync(input);
        return true;
      } catch (error) {
        console.error("Error creating agent:", error);
        return false;
      }
    },
    [createAgentMutation],
  );

  const updateAgent = useCallback(
    async (id: string, updates: Partial<CreateAgentInput>) => {
      try {
        await updateAgentMutation.mutateAsync({ id, updates });
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateAgentMutation],
  );

  const deleteAgent = useCallback(
    async (id: string) => {
      try {
        await deleteAgentMutation.mutateAsync(id);
        return true;
      } catch (error) {
        return false;
      }
    },
    [deleteAgentMutation],
  );

  const updateAgentStatus = useCallback(
    async (id: string, status: AgentStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ id, status });
        return true;
      } catch (error) {
        return false;
      }
    },
    [updateStatusMutation],
  );

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
    isLoading:
      createAgentMutation.isPending ||
      updateAgentMutation.isPending ||
      deleteAgentMutation.isPending ||
      updateStatusMutation.isPending,
    error:
      createAgentMutation.error ||
      updateAgentMutation.error ||
      deleteAgentMutation.error ||
      updateStatusMutation.error,
  };
}

export function useAgentFilters() {
  const uiStore = useAgentUIStore();

  const setStatusFilter = useCallback(
    (status: AgentStatus | undefined) => {
      uiStore.setFilters({ status });
    },
    [uiStore],
  );

  const setSearchFilter = useCallback(
    (search: string) => {
      uiStore.setFilters({ search: search.trim() || undefined });
    },
    [uiStore],
  );

  const clearFilters = useCallback(() => {
    uiStore.clearFilters();
  }, [uiStore]);

  return {
    filters: uiStore.filters,
    setStatusFilter,
    setSearchFilter,
    clearFilters,
  };
}
