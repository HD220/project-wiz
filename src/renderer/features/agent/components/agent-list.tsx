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

import { Badge } from "@/renderer/components/ui/badge";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { StatusIndicator } from "@/renderer/components/ui/status-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";
import { Separator } from "@/renderer/components/ui/separator";
import { Switch } from "@/renderer/components/ui/switch";
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
      <div className="space-y-[var(--spacing-layout-lg)]">
        {/* Enhanced Page Header */}
        <div className="flex flex-col gap-[var(--spacing-component-lg)] lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-[var(--spacing-component-sm)]">
            <div className="flex items-center gap-[var(--spacing-component-md)]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-1/20 via-chart-1/10 to-chart-1/5 flex items-center justify-center border border-chart-1/20">
                <Users className="size-5 text-chart-1" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  AI Agents
                </h1>
                <p className="text-lg text-muted-foreground">
                  Create and manage intelligent AI agents for your projects
                </p>
              </div>
            </div>
          </div>
          <Link to="/user/agents/new">
            <Button className="gap-[var(--spacing-component-sm)] h-11 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200">
              <Plus className="size-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        <Separator className="bg-border/50" />

        {/* Enhanced Empty State */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {/* Hero Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-chart-1/20 via-chart-1/10 to-chart-1/5 flex items-center justify-center border border-chart-1/20 shadow-lg shadow-chart-1/10">
              <Users className="size-12 text-chart-1" />
            </div>
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-chart-1/20 to-chart-1/10 blur opacity-30 animate-pulse"></div>
          </div>

          <div className="space-y-4 max-w-md">
            <h3 className="text-2xl font-bold text-foreground">
              No agents created yet
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Create your first AI agent to start automating tasks and improving
              productivity
            </p>
          </div>

          <div className="mt-8">
            <Link to="/user/agents/new">
              <Button
                size="lg"
                className="gap-[var(--spacing-component-md)] h-12 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200"
              >
                <Plus className="size-5" />
                Create Your First Agent
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-component-md)] mt-12 max-w-3xl">
            <div className="p-[var(--spacing-component-md)] rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
              <div className="w-8 h-8 rounded-md bg-chart-2/10 flex items-center justify-center mb-3">
                <span className="text-chart-2 text-sm">🤖</span>
              </div>
              <h4 className="font-medium text-sm text-foreground mb-1">
                Intelligent Automation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI agents that understand context and execute complex tasks
              </p>
            </div>
            <div className="p-[var(--spacing-component-md)] rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
              <div className="w-8 h-8 rounded-md bg-chart-3/10 flex items-center justify-center mb-3">
                <span className="text-chart-3 text-sm">⚡</span>
              </div>
              <h4 className="font-medium text-sm text-foreground mb-1">
                Fast Configuration
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Quick setup with pre-configured templates and settings
              </p>
            </div>
            <div className="p-[var(--spacing-component-md)] rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
              <div className="w-8 h-8 rounded-md bg-chart-4/10 flex items-center justify-center mb-3">
                <span className="text-chart-4 text-sm">🎯</span>
              </div>
              <h4 className="font-medium text-sm text-foreground mb-1">
                Goal-Oriented
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents focused on achieving specific objectives and results
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-[var(--spacing-layout-lg)]">
        {/* Enhanced Page Header with Stats */}
        <div className="flex flex-col gap-[var(--spacing-component-lg)] lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-[var(--spacing-component-sm)]">
            <div className="flex items-center gap-[var(--spacing-component-md)]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-chart-1/20 via-chart-1/10 to-chart-1/5 flex items-center justify-center border border-chart-1/20">
                <Users className="size-5 text-chart-1" />
              </div>
              <div className="flex items-center gap-[var(--spacing-component-md)]">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    AI Agents
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your intelligent AI agents and their configurations
                  </p>
                </div>
                {agentStats.total > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    {agentStats.total}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Link to="/user/agents/new">
            <Button className="gap-[var(--spacing-component-sm)] lg:shrink-0 h-11 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200">
              <Plus className="size-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="flex flex-col gap-[var(--spacing-component-md)] sm:flex-row sm:items-center">
          {/* Enhanced Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents by name or role..."
              value={search.search || ""}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9 h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
            />
          </div>

          <div className="flex items-center gap-[var(--spacing-component-sm)]">
            {/* Enhanced Status Filter */}
            <Select
              value={search.status || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-40 h-11 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200">
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

            {/* Enhanced Show Inactive Toggle */}
            <div className="flex items-center gap-[var(--spacing-component-sm)] px-3 py-2 rounded-lg border border-border/60 bg-card/50 hover:bg-card transition-colors">
              <Switch
                id="show-inactive"
                checked={!!search.showInactive}
                onCheckedChange={handleToggleInactive}
              />
              <label
                htmlFor="show-inactive"
                className="flex cursor-pointer items-center gap-[var(--spacing-component-sm)] text-sm font-medium"
              >
                {search.showInactive ? (
                  <Eye className="size-4 text-chart-2" />
                ) : (
                  <EyeOff className="size-4 text-muted-foreground" />
                )}
                Show Inactive
              </label>
            </div>

            {/* Enhanced Clear Filters */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3 hover:bg-accent/50 transition-all duration-200"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Agent Statistics */}
        {agentStats.total > 0 && (
          <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-[var(--spacing-component-lg)] shadow-sm">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Agent Overview
            </h3>
            <div className="flex flex-wrap items-center gap-[var(--spacing-component-lg)]">
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <StatusIndicator
                  status="active"
                  size="md"
                  variant="dot"
                  className="bg-chart-1"
                />
                <span className="text-sm font-medium text-foreground">
                  Total:
                </span>
                <Badge
                  variant="outline"
                  className="border-chart-1/30 text-chart-1 bg-chart-1/5"
                >
                  {agentStats.total}
                </Badge>
              </div>
              <div className="flex items-center gap-[var(--spacing-component-sm)]">
                <StatusIndicator status="active" size="md" variant="dot" />
                <span className="text-sm font-medium text-foreground">
                  Active:
                </span>
                <Badge className="bg-chart-2 hover:bg-chart-2/90 text-white border-chart-2">
                  {agentStats.active}
                </Badge>
              </div>
              {agentStats.inactive > 0 && (
                <div className="flex items-center gap-[var(--spacing-component-sm)]">
                  <StatusIndicator status="inactive" size="md" variant="dot" />
                  <span className="text-sm font-medium text-foreground">
                    Inactive:
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-muted/30 text-muted-foreground border-muted-foreground/20"
                  >
                    {agentStats.inactive}
                  </Badge>
                </div>
              )}
              {agentStats.busy > 0 && (
                <div className="flex items-center gap-[var(--spacing-component-sm)]">
                  <StatusIndicator status="busy" size="md" variant="dot" />
                  <span className="text-sm font-medium text-foreground">
                    Busy:
                  </span>
                  <Badge
                    variant="outline"
                    className="border-destructive/30 text-destructive bg-destructive/5"
                  >
                    {agentStats.busy}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Empty Filter Results */}
        {filteredAgents.length === 0 && hasFilters && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center border border-border/50">
                <AlertCircle className="size-10 text-muted-foreground" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20 blur opacity-50"></div>
            </div>

            <div className="space-y-4 max-w-md">
              <h3 className="text-2xl font-bold text-foreground">
                No agents match your filters
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Try adjusting your search criteria or clear the filters to see
                all agents
              </p>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-11 px-6 border-border/60 hover:bg-accent/50 transition-all duration-200"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Agents Grid/List */}
        {filteredAgents.length > 0 && (
          <>
            <Separator className="bg-border/50" />
            <div className="grid gap-[var(--spacing-component-lg)] sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
