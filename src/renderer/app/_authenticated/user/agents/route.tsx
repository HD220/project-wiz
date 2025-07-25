import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AgentFiltersSchema } from "@/renderer/features/agent/agent.schema";
import { AgentList } from "@/renderer/features/agent/components/agent-list";
import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { loadApiData } from "@/renderer/lib/route-loader";

function AgentsLayout() {
  const agents = Route.useLoaderData();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="AI Agents"
        description="Create and manage your AI agents for automated tasks and conversations"
      />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">
          <AgentList agents={agents} showInactive={false} />
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
    // Load agents without includeInactive (removed from schema)
    let agents = await loadApiData(
      () => window.api.agents.list(deps.search),
      "Failed to load agents",
    );

    // Client-side filtering for status and search
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
