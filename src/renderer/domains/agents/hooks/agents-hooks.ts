import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

/**
 * Consolidated Agents Hooks
 * Combines multiple scattered hooks into a single, maintainable file
 */

// Types
interface Agent {
  id: string;
  name: string;
  role: string;
  goal: string;
  backstory: string;
  status: "active" | "inactive" | "busy";
  llmProviderId: string;
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateAgentData {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature?: number;
  maxTokens?: number;
}

interface UpdateAgentData {
  name?: string;
  role?: string;
  goal?: string;
  backstory?: string;
  llmProviderId?: string;
  temperature?: number;
  maxTokens?: number;
  status?: "active" | "inactive" | "busy";
}

// API functions (assuming these exist in preload API)
declare global {
  interface Window {
    electronAPI: {
      agents: {
        getAll: () => Promise<Agent[]>;
        getById: (id: string) => Promise<Agent | null>;
        getByName: (name: string) => Promise<Agent | null>;
        getActive: () => Promise<Agent[]>;
        create: (data: CreateAgentData) => Promise<Agent>;
        update: (id: string, data: UpdateAgentData) => Promise<Agent>;
        delete: (id: string) => Promise<void>;
        activate: (id: string) => Promise<Agent>;
        deactivate: (id: string) => Promise<Agent>;
        setDefault: (id: string) => Promise<Agent>;
        count: () => Promise<number>;
        countActive: () => Promise<number>;
      };
    };
  }
}

// Query keys
const QUERY_KEYS = {
  agents: ["agents"] as const,
  agentById: (id: string) => ["agents", id] as const,
  agentByName: (name: string) => ["agents", "name", name] as const,
  activeAgents: ["agents", "active"] as const,
  agentCount: ["agents", "count"] as const,
  activeAgentCount: ["agents", "active", "count"] as const,
};

// QUERY HOOKS
export function useAgents() {
  return useQuery({
    queryKey: QUERY_KEYS.agents,
    queryFn: () => window.electronAPI.agents.getAll(),
    staleTime: 30000, // 30 seconds
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agentById(id),
    queryFn: () => window.electronAPI.agents.getById(id),
    enabled: !!id,
    staleTime: 30000,
  });
}

export function useAgentByName(name: string) {
  return useQuery({
    queryKey: QUERY_KEYS.agentByName(name),
    queryFn: () => window.electronAPI.agents.getByName(name),
    enabled: !!name,
    staleTime: 30000,
  });
}

export function useActiveAgents() {
  return useQuery({
    queryKey: QUERY_KEYS.activeAgents,
    queryFn: () => window.electronAPI.agents.getActive(),
    staleTime: 10000, // 10 seconds for active agents
  });
}

export function useAgentCount() {
  return useQuery({
    queryKey: QUERY_KEYS.agentCount,
    queryFn: () => window.electronAPI.agents.count(),
    staleTime: 60000, // 1 minute
  });
}

export function useActiveAgentCount() {
  return useQuery({
    queryKey: QUERY_KEYS.activeAgentCount,
    queryFn: () => window.electronAPI.agents.countActive(),
    staleTime: 30000,
  });
}

// MUTATION HOOKS
export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAgentData) =>
      window.electronAPI.agents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentCount });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentData }) =>
      window.electronAPI.agents.update(id, data),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agentById(agent.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgentCount });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => window.electronAPI.agents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentCount });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgentCount });
    },
  });
}

export function useActivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => window.electronAPI.agents.activate(id),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agentById(agent.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgentCount });
    },
  });
}

export function useDeactivateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => window.electronAPI.agents.deactivate(id),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.agentById(agent.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgentCount });
    },
  });
}

export function useSetDefaultAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => window.electronAPI.agents.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
    },
  });
}

// COMPOUND HOOKS (combining multiple concerns)
export function useAgentOperations() {
  const createMutation = useCreateAgent();
  const updateMutation = useUpdateAgent();
  const deleteMutation = useDeleteAgent();
  const activateMutation = useActivateAgent();
  const deactivateMutation = useDeactivateAgent();
  const setDefaultMutation = useSetDefaultAgent();

  return {
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    activate: activateMutation.mutateAsync,
    deactivate: deactivateMutation.mutateAsync,
    setDefault: setDefaultMutation.mutateAsync,
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      activateMutation.isPending ||
      deactivateMutation.isPending ||
      setDefaultMutation.isPending,
  };
}

// STATE MANAGEMENT HOOK
export function useAgentSelection() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const selectedAgent = useAgent(selectedAgentId || "");

  return {
    selectedAgentId,
    selectedAgent: selectedAgent.data,
    setSelectedAgentId,
    clearSelection: () => setSelectedAgentId(null),
  };
}

// FILTER/SEARCH HOOK
export function useAgentFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "busy"
  >("all");

  const { data: agents = [] } = useAgents();

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      !searchTerm ||
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredAgents,
    resultCount: filteredAgents.length,
  };
}

// UTILITY HOOK
export function useAgentRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agents });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgents });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentCount });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeAgentCount });
  }, [queryClient]);

  return { refreshAll };
}

// MAIN HOOK (combines everything for simple usage)
export function useAgentManagement() {
  const queries = {
    agents: useAgents(),
    activeAgents: useActiveAgents(),
    agentCount: useAgentCount(),
    activeAgentCount: useActiveAgentCount(),
  };

  const operations = useAgentOperations();
  const selection = useAgentSelection();
  const filter = useAgentFilter();
  const refresh = useAgentRefresh();

  return {
    // Data
    agents: queries.agents.data || [],
    activeAgents: queries.activeAgents.data || [],
    agentCount: queries.agentCount.data || 0,
    activeAgentCount: queries.activeAgentCount.data || 0,

    // Loading states
    isLoading: queries.agents.isLoading || queries.activeAgents.isLoading,
    isOperationLoading: operations.isLoading,

    // Operations
    create: operations.create,
    update: operations.update,
    delete: operations.delete,
    activate: operations.activate,
    deactivate: operations.deactivate,
    setDefault: operations.setDefault,

    // Selection
    selectedAgentId: selection.selectedAgentId,
    selectedAgent: selection.selectedAgent,
    setSelectedAgentId: selection.setSelectedAgentId,
    clearSelection: selection.clearSelection,

    // Filter
    searchTerm: filter.searchTerm,
    setSearchTerm: filter.setSearchTerm,
    statusFilter: filter.statusFilter,
    setStatusFilter: filter.setStatusFilter,
    filteredAgents: filter.filteredAgents,
    resultCount: filter.resultCount,

    // Utilities
    refreshAll: refresh.refreshAll,
  };
}
