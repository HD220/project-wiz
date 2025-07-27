import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Filter,
  Plus,
  Search,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
} from "lucide-react";
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
import { Switch } from "@/renderer/components/ui/switch";
import { Separator } from "@/renderer/components/ui/separator";
import { Badge } from "@/renderer/components/ui/badge";
import type {
  SelectAgent,
  AgentStatus,
} from "@/renderer/features/agent/agent.types";
import { AgentDeleteDialog } from "@/renderer/features/agent/components/agent-delete-dialog";
import { AgentListCard } from "@/renderer/features/agent/components/agent-list-card";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

interface AgentListProps {
  agents: SelectAgent[];
  showInactive?: boolean;
}

export function AgentList(props: AgentListProps) {
  const { agents } = props;

  // Get URL search params and navigation following INLINE-FIRST principles
  const search = useSearch({ from: "/_authenticated/user/agents" });
  const navigate = useNavigate();

  // Local state for UI interactions only
  const [agentToDelete, setAgentToDelete] = useState<SelectAgent | null>(null);

  // Inline API mutations with proper error handling
  const deleteAgentMutation = useApiMutation(
    (id: string) => window.api.agents.delete(id),
    {
      successMessage: "Agent deleted successfully",
      errorMessage: "Failed to delete agent",
      invalidateRouter: true,
    },
  );

  const restoreAgentMutation = useApiMutation(
    (id: string) => window.api.agents.restore(id),
    {
      successMessage: "Agent restored successfully",
      errorMessage: "Failed to restore agent",
      invalidateRouter: true,
    },
  );

  const toggleStatusMutation = useApiMutation(
    ({ id, status }: { id: string; status: AgentStatus }) =>
      window.api.agents.updateStatus(id, status),
    {
      errorMessage: "Failed to update agent status",
    },
  );

  // Inline action handlers following INLINE-FIRST principles
  function handleDelete(agent: SelectAgent) {
    setAgentToDelete(agent);
  }

  function handleRestore(agent: SelectAgent) {
    restoreAgentMutation.mutate(agent.id);
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

    // Inline success message with proper status text
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

  function handleToggleInactive(checked: boolean) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        showInactive: checked,
      },
    });
  }

  function clearFilters() {
    navigate({
      to: "/user/agents",
      search: {},
    });
  }

  // Inline filter checking and agent categorization following INLINE-FIRST principles
  const hasFilters = !!(search.status || search.search || search.showInactive);
  const filteredAgents = agents; // Backend already handles filtering
  const activeAgents = agents.filter((agent) => agent.isActive);
  const inactiveAgents = agents.filter((agent) => !agent.isActive);

  // Inline statistics calculation for UI display
  const agentStats = {
    total: filteredAgents.length,
    active: activeAgents.length,
    inactive: inactiveAgents.length,
    busy: agents.filter((agent) => agent.status === "busy").length,
  };

  // Render empty state when no agents exist and no filters are applied
  if (filteredAgents.length === 0 && !hasFilters) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold tracking-tight">
                AI Agents
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Create and manage intelligent AI agents for your projects
            </p>
          </div>
          <Link to="/user/agents/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        <Separator />

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 rounded-2xl bg-muted/50 p-4">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No agents created yet</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Create your first AI agent to start automating tasks and improving
            productivity
          </p>
          <Link to="/user/agents/new">
            <Button size="lg" className="gap-2">
              <Plus className="size-4" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Page Header with Stats */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold tracking-tight">
                AI Agents
              </h2>
              {agentStats.total > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {agentStats.total}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your intelligent AI agents and their configurations
            </p>
          </div>

          <Link to="/user/agents/new">
            <Button className="gap-2 lg:shrink-0">
              <Plus className="size-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or role..."
              value={search.search || ""}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <Select
              value={search.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-36">
                <Filter className="mr-2 size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>

            {/* Show Inactive Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive"
                checked={!!search.showInactive}
                onCheckedChange={handleToggleInactive}
              />
              <label
                htmlFor="show-inactive"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                {search.showInactive ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
                Show Inactive
              </label>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Agent Statistics */}
        {agentStats.total > 0 && (
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Total:</span>
              <Badge variant="outline">{agentStats.total}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Active:</span>
              <Badge
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                {agentStats.active}
              </Badge>
            </div>
            {agentStats.inactive > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Inactive:</span>
                <Badge variant="secondary">{agentStats.inactive}</Badge>
              </div>
            )}
            {agentStats.busy > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Busy:</span>
                <Badge
                  variant="outline"
                  className="border-destructive text-destructive"
                >
                  {agentStats.busy}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Empty Filter Results */}
        {filteredAgents.length === 0 && hasFilters && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-2xl bg-muted/50 p-4">
              <AlertCircle className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">
              No agents match your filters
            </h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search criteria or clear the filters to see all
              agents
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Agents Grid/List */}
        {filteredAgents.length > 0 && (
          <>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <AgentListCard
                  key={agent.id}
                  agent={agent}
                  onDelete={() => handleDelete(agent)}
                  onRestore={() => handleRestore(agent)}
                  onToggleStatus={() => handleToggleStatus(agent)}
                />
              ))}
            </div>
          </>
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
