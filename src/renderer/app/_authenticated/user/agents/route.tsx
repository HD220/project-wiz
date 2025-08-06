import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { SelectAgent } from "@/renderer/features/agent/agent.types";

import { AgentFiltersSchema } from "@/renderer/features/agent/agent.schema";
import { AgentList } from "@/renderer/features/agent/components/agent-list";
import { loadApiData } from "@/renderer/lib/route-loader";

function AgentsLayout() {
  const agents = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AgentList agents={agents} showInactive={search.showInactive} />

      {/* Modals/Child Routes */}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/agents")({
  validateSearch: (search) => AgentFiltersSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    // Load agents with proper filtering
    const agents = await loadApiData(
      () => window.api.agent.list(deps.search),
      "Failed to load agents",
    );

    return agents;
  },
  component: AgentsLayout,
});
