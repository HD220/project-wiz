import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import type {
  SelectAgent,
  AgentStatus,
} from "@/renderer/features/agent/agent.types";
import { AgentDeleteDialog } from "@/renderer/features/agent/components/agent-delete-dialog";
import { AgentListCard } from "@/renderer/features/agent/components/agent-list-card";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

interface AgentListProps {
  agents: SelectAgent[];
}

function AgentList(props: AgentListProps) {
  const { agents } = props;

  // SIMPLE: Get URL search params and navigation
  const search = useSearch({ from: "/_authenticated/user/agents" });
  const navigate = useNavigate();

  // SIMPLE: Local state for UI only
  const [agentToDelete, setAgentToDelete] = useState<SelectAgent | null>(null);

  // Delete agent mutation with inline messages
  const deleteAgentMutation = useApiMutation(
    (id: string) => window.api.agents.delete(id),
    {
      successMessage: "Agent deleted successfully",
      errorMessage: "Failed to delete agent",
      invalidateRouter: true,
    },
  );

  // Custom mutation for status toggle
  const toggleStatusMutation = useApiMutation(
    ({ id, status }: { id: string; status: AgentStatus }) =>
      window.api.agents.updateStatus(id, status),
    {
      errorMessage: "Failed to update agent status",
    },
  );

  function handleDelete(agent: SelectAgent) {
    setAgentToDelete(agent);
  }

  function confirmDelete() {
    if (!agentToDelete) return;
    deleteAgentMutation.mutate(agentToDelete.id);
    setAgentToDelete(null);
  }

  function handleToggleStatus(agent: SelectAgent) {
    const newStatus: AgentStatus =
      agent.status === "active" ? "inactive" : "active";
    toggleStatusMutation.mutate({ id: agent.id, status: newStatus });
    toast.success(
      `Agent ${newStatus === "active" ? "activated" : "deactivated"}`,
    );
  }

  // SIMPLE: URL params for filters (shareable and bookmarkable)
  function handleStatusFilter(value: string) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        status: value === "all" ? undefined : (value as AgentStatus),
      },
    });
  }

  function handleSearchChange(value: string) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        search: value.trim() || undefined,
      },
    });
  }

  function clearFilters() {
    navigate({
      to: "/user/agents",
      search: {},
    });
  }

  // SIMPLE: Check if we have filters for UI purposes
  const hasFilters = search.status || search.search;

  // NO LOADING STATES NEEDED - data comes from loader
  // NO ERROR STATES NEEDED - loader throws on error

  // SIMPLE: Empty state when no agents and no filters
  if (agents.length === 0 && !hasFilters) {
    return (
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">Your AI Agents</h3>
            <p className="text-sm text-muted-foreground">
              Create and manage your AI agents
            </p>
          </div>
          <Link to="/user/agents/new">
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No agents created yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first AI agent to get started
          </p>
          <Link to="/user/agents/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={search.search || ""}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={search.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          {/* New Agent Button */}
          <Link to="/user/agents/new">
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Results Info */}
        {agents.length > 0 && (
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Your AI Agents</h3>
            <span className="text-sm text-muted-foreground">
              ({agents.length})
            </span>
          </div>
        )}

        {/* Empty Filter Results */}
        {agents.length === 0 && hasFilters && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No agents found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Try adjusting your search filters
            </p>
            <Button variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Agents List */}
        {agents.length > 0 && (
          <div className="space-y-2">
            {agents.map((agent) => (
              <AgentListCard
                key={agent.id}
                agent={agent}
                onDelete={() => handleDelete(agent)}
                onToggleStatus={() => handleToggleStatus(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AgentDeleteDialog
        agent={agentToDelete}
        open={!!agentToDelete}
        onOpenChange={(open) => !open && setAgentToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteAgentMutation.isPending}
      />
    </>
  );
}

export { AgentList };
