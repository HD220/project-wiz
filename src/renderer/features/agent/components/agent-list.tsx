import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Users,
  AlertCircle,
  LayoutGrid,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Switch } from "@/renderer/components/ui/switch";
import type {
  SelectAgent,
  AgentStatus,
  AgentWithAvatar,
} from "@/renderer/features/agent/agent.types";
import { AgentDeleteDialog } from "@/renderer/features/agent/components/agent-delete-dialog";
import { AgentListItem } from "@/renderer/features/agent/components/agent-card";
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
      <div className="flex flex-col h-full">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                AI Agents
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your AI agents and configurations
              </p>
            </div>
          </div>
          <Link to="/user/agents/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Agent
            </Button>
          </Link>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
            <LayoutGrid className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-3">
            No agents created yet
          </h3>
          <p className="text-base text-muted-foreground mb-8 max-w-lg leading-relaxed">
            Create your first AI agent to start automating tasks, managing
            conversations, and building intelligent workflows for your projects.
          </p>
          <Link to="/user/agents/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Your First Agent
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <LayoutGrid className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                AI Agents
              </h1>
              <p className="text-sm text-muted-foreground">
                {agentStats.total} agents • {agentStats.active} active •{" "}
                {agentStats.busy} busy
              </p>
            </div>
          </div>
          <Link to="/user/agents/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Agent
            </Button>
          </Link>
        </div>

        {/* Professional Filters */}
        <div className="flex items-center gap-4 px-6 py-3 border-b border-border/30 bg-background/50 shrink-0">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search.search || ""}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-10 h-9 border-border/60 bg-background/50 focus:bg-background"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={search.status || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-32 h-9 border-border/60 bg-background/50">
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
          <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-border/60 bg-background/50">
            <Switch
              id="show-inactive"
              checked={!!search.showInactive}
              onCheckedChange={handleToggleInactive}
            />
            <label
              htmlFor="show-inactive"
              className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              {search.showInactive ? (
                <>
                  <Eye className="w-4 h-4" />
                  Show Inactive
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Inactive
                </>
              )}
            </label>
          </div>

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-3"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Empty Filter Results */}
        {filteredAgents.length === 0 && hasFilters && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No agents match your filters
            </h3>
            <p className="text-base text-muted-foreground mb-6 max-w-md">
              Try adjusting your search criteria or clearing the filters to see
              all agents.
            </p>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <Search className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        )}

        {/* Professional Agent List with 2-column layout */}
        {filteredAgents.length > 0 && (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-1">
                {filteredAgents.map((agent) => (
                  <AgentListItem
                    key={agent.id}
                    agent={agent as AgentWithAvatar}
                    onDelete={() => handleDelete(agent)}
                    onToggleStatus={() => handleToggleStatus(agent)}
                    isLoading={
                      deleteAgentMutation.isPending ||
                      restoreAgentMutation.isPending ||
                      toggleStatusMutation.isPending
                    }
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
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
