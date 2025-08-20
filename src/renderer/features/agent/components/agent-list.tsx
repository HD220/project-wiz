import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, Search, AlertCircle, LayoutGrid } from "lucide-react";
import { useState } from "react";

import { CustomLink } from "@/renderer/components/custom-link";
import { SearchFilterBar } from "@/renderer/components/search-filter-bar";
import { Button } from "@/renderer/components/ui/button";
import { ConfirmationDialog } from "@/renderer/components/ui/confirmation-dialog";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { AgentListItem } from "@/renderer/features/agent/components/agent-card";
import { useAgentActions } from "@/renderer/features/agent/hooks/use-agent-actions.hook";
// Simple validation functions inline
function validateSearchInput(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > 100) return trimmed.slice(0, 100);
  return trimmed;
}

function validateSelectFilter<T extends string>(
  value: string,
  validValues: readonly T[],
): T | undefined {
  if (value === "all" || !value) return undefined;
  return validValues.find((valid) => valid === value);
}
import { cn } from "@/renderer/lib/utils";

import type { Agent } from "@/shared/types/agent";

interface AgentListProps {
  agents: Agent[];
  showInactive?: boolean;
}

export function AgentList(props: AgentListProps) {
  const { agents } = props;

  // Get URL search params and navigation following INLINE-FIRST principles
  const search = useSearch({ from: "/_authenticated/user/agents" });
  const navigate = useNavigate();

  // Local state for UI interactions only
  const { handleToggleStatus, isTogglingStatus } = useAgentActions();
  const [agentToToggle, setAgentToToggle] = useState<Agent | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // IMPROVED: Type-safe status filter with validation
  function handleStatusFilter(value: string) {
    navigate({
      to: "/user/agents",
      search: {
        ...search,
        status: validateSelectFilter(value, ["active", "inactive", "busy"]),
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

  function handleShowConfirmDialog(agent: Agent) {
    // Only show confirmation for deactivation, not activation
    if (!agent.deactivatedAt) {
      setAgentToToggle(agent);
      setShowConfirmDialog(true);
    } else {
      // Direct activation without confirmation
      handleToggleStatus(agent);
    }
  }

  function handleCloseConfirmDialog() {
    setShowConfirmDialog(false);
    setAgentToToggle(null);
  }

  async function handleConfirmToggleStatus() {
    if (agentToToggle) {
      await handleToggleStatus(agentToToggle);
      handleCloseConfirmDialog();
    }
  }

  // Inline filter checking and agent categorization following INLINE-FIRST principles
  const hasFilters = !!(search.status || search.search || search.showInactive);
  const filteredAgents = agents; // Backend already handles filtering
  const activeAgents = agents.filter((agent) => !agent.deactivatedAt);
  const inactiveAgents = agents.filter((agent) => !!agent.deactivatedAt);

  // Inline statistics calculation for UI display
  const agentStats = {
    total: filteredAgents.length,
    active: activeAgents.length,
    inactive: inactiveAgents.length,
    busy: agents.filter((agent) => agent.status === "busy").length,
  };

  // Simple responsive grid using Tailwind breakpoints
  const gridColumns = "grid-cols-1 xl:grid-cols-2"; // 1 column on small/medium, 2 on large screens

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

        {/* Empty State when no agents match (with filters available) */}
        {filteredAgents.length === 0 && !hasFilters && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
              <LayoutGrid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No active agents found
            </h3>
            <p className="text-base text-muted-foreground mb-6 max-w-md">
              You might have inactive agents. Try enabling &quot;Show
              Inactive&quot; above to see all agents, or create your first
              agent.
            </p>
            <CustomLink to="/user/agents/new" size="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Create New Agent
            </CustomLink>
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
                    agent={{ ...agent, avatar: agent.avatar || null }}
                    onDelete={() => handleShowConfirmDialog(agent)}
                    isLoading={isTogglingStatus}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={handleCloseConfirmDialog}
        onConfirm={handleConfirmToggleStatus}
        title="Deactivate Agent"
        description={`Are you sure you want to deactivate "${agentToToggle?.name}"? This will make the agent unavailable for new conversations.`}
        confirmText="Deactivate"
        variant="destructive"
        isLoading={isTogglingStatus}
      />
    </>
  );
}
