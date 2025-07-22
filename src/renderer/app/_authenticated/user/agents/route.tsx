import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AgentFiltersSchema } from "@/main/features/agent/agent.schema";

import { AgentList } from "@/renderer/features/agent/components/agent-list";
import { ContentHeader } from "@/renderer/features/app/components/content-header";

function AgentsLayout() {
  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="AI Agents"
        description="Create and manage your AI agents for automated tasks and conversations"
      />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">
          <AgentList />
        </div>
      </main>

      {/* Modals/Child Routes */}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents")({
  validateSearch: (search) => AgentFiltersSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    // Simple data loading with filtering
    const response = await window.api.agents.list();
    if (!response.success) {
      throw new Error(response.error || "Failed to load agents");
    }

    let agents = response.data || [];

    // Client-side filtering for now (simpler implementation)
    if (deps.search.status) {
      agents = agents.filter((agent) => agent.status === deps.search.status);
    }

    if (deps.search.search) {
      const searchTerm = deps.search.search.toLowerCase();
      agents = agents.filter(
        (agent) =>
          agent.name.toLowerCase().includes(searchTerm) ||
          agent.role.toLowerCase().includes(searchTerm),
      );
    }

    return agents;
  },
  component: AgentsLayout,
});
