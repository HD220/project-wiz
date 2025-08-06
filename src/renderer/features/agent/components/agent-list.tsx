import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Search, AlertCircle, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { CustomLink } from "@/renderer/components/custom-link";
import { SearchFilterBar } from "@/renderer/components/search-filter-bar";
import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import type {
  SelectAgent,
  AgentStatus,
} from "@/renderer/features/agent/agent.types";
import { AgentListItem } from "@/renderer/features/agent/components/agent-card";
import { AgentDeleteDialog } from "@/renderer/features/agent/components/agent-delete-dialog";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";
import {
  validateSearchInput,
  validateStatusFilter,
} from "@/renderer/lib/search-validation";
import { cn } from "@/renderer/lib/utils";

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
    (id: string) => window.api.agent.inactivate({ agentId: id }),
    {
      successMessage: "Agent deleted successfully",
      errorMessage: "Failed to delete agent",
      invalidateRouter: true,
    },
  );

  const restoreAgentMutation = useApiMutation(
    (id: string) => window.api.agent.activate({ agentId: id }),
    {
      successMessage: "Agent restored successfully",
      errorMessage: "Failed to restore agent",
      invalidateRouter: true,
    },
  );

  const toggleStatusMutation = useApiMutation(
    ({ id, status }: { id: string; status: AgentStatus }) =>
      window.api.agent.update({ id, status }),
    {
      errorMessage: "Failed to update agent status",
    },
  );

  // Inline action handlers following INLINE-FIRST principles
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

    // Inline success message with proper status text
    toast.success(
      `Agent ${newStatus === "active" ? "activated" : "deactivated"}`,
    );
  }
  // IMPROVED: Type-safe status filter with validation
  function handleStatusFilter(value: string) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        status: validateStatusFilter(value),
      },
    });
  }

  // IMPROVED: Centralized search validation - no more duplication
  function handleSearchChange(value: string) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        search: validateSearchInput(value),
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

  // Simple responsive grid using Tailwind breakpoints
  const gridColumns = "grid-cols-1 xl:grid-cols-2"; // 1 column on small/medium, 2 on large screens

  // Render empty state when no agents exist and no filters are applied
  if (filteredAgents.length === 0 && !hasFilters) {
    return (
      <div className="flex flex-col h-full">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
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
          <CustomLink to="/user/agents/new" className="gap-2">
            <Plus className="w-4 h-4" />
            New Agent
          </CustomLink>
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
          <CustomLink to="/user/agents/new" size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Create Your First Agent
          </CustomLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-[var(--spacing-component-lg)] py-[var(--spacing-component-md)] border-b border-border/50 bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-[var(--spacing-component-md)]">
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
          <CustomLink to="/user/agents/new" className="gap-2">
            <Plus className="w-4 h-4" />
            New Agent
          </CustomLink>
        </div>

        {/* Professional Filters */}
        <SearchFilterBar
          searchValue={search.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search agents..."
          filterValue={search.status || "all"}
          onFilterChange={handleStatusFilter}
          filterOptions={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "busy", label: "Busy" },
          ]}
          filterPlaceholder="Status"
          toggleValue={!!search.showInactive}
          onToggleChange={handleToggleInactive}
          toggleLabel="Show Inactive"
          toggleId="show-inactive-agents"
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
        />

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

        {/* Professional Agent List with responsive grid layout */}
        {filteredAgents.length > 0 && (
          <ScrollArea className="flex-1">
            <div className="p-[var(--spacing-component-xs)] lg:p-[var(--spacing-component-sm)] space-y-[var(--spacing-component-xs)]">
              <div
                className={cn(
                  "grid gap-[var(--spacing-component-xxs)] lg:gap-[var(--spacing-component-xs)]",
                  gridColumns,
                )}
              >
                {filteredAgents.map((agent) => (
                  <AgentListItem
                    key={agent.id}
                    agent={{ ...agent, avatar: undefined }}
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
