import { Link } from "@tanstack/react-router";
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
import {
  useAgent,
  useAgentActions,
  useAgentFilters,
} from "@/renderer/features/agent/use-agent.hook";

function AgentList() {
  const { filteredAgents, isLoading, error } = useAgent();
  const { deleteAgent, toggleAgentStatus } = useAgentActions();
  const { filters, setStatusFilter, setSearchFilter, clearFilters } =
    useAgentFilters();

  const [agentToDelete, setAgentToDelete] = useState<SelectAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete(agent: SelectAgent) {
    setAgentToDelete(agent);
  }

  async function confirmDelete() {
    if (!agentToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteAgent(agentToDelete.id);
      if (success) {
        toast.success("Agent deleted successfully");
        setAgentToDelete(null);
      } else {
        toast.error("Failed to delete agent");
      }
    } catch (error) {
      toast.error("Failed to delete agent");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleToggleStatus(agent: SelectAgent) {
    try {
      const success = await toggleAgentStatus(agent.id, agent.status);
      if (success) {
        const newStatus = agent.status === "active" ? "inactive" : "active";
        toast.success(
          `Agent ${newStatus === "active" ? "activated" : "deactivated"}`,
        );
      } else {
        toast.error("Failed to update agent status");
      }
    } catch (error) {
      toast.error("Failed to update agent status");
    }
  }

  function handleStatusFilter(value: string) {
    if (value === "all") {
      setStatusFilter(undefined);
    } else {
      setStatusFilter(value as AgentStatus);
    }
  }

  function handleSearchChange(value: string) {
    setSearchFilter(value);
  }

  const hasFilters = filters.status || filters.search;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-60 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive text-sm">{error.message}</p>
        <Button variant="outline" size="sm" className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  if (filteredAgents.length === 0 && !hasFilters) {
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
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || "all"}
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
        {filteredAgents.length > 0 && (
          <div className="flex items-center gap-2">
            <h3 className="font-medium">Your AI Agents</h3>
            <span className="text-sm text-muted-foreground">
              ({filteredAgents.length})
            </span>
          </div>
        )}

        {/* Empty Filter Results */}
        {filteredAgents.length === 0 && hasFilters && (
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
        {filteredAgents.length > 0 && (
          <div className="space-y-2">
            {filteredAgents.map((agent) => (
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
        isLoading={isDeleting}
      />
    </>
  );
}

export { AgentList };
