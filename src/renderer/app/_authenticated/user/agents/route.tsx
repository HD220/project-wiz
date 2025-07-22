import { createFileRoute, Outlet } from "@tanstack/react-router";

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
  beforeLoad: async ({ context }) => {
    const { auth } = context;
    const { user } = auth;

    if (!user) {
      throw new Error("User not authenticated");
    }

    // Load agents data
    const response = await window.api.agents.list();
    if (!response.success) {
      throw new Error(response.error || "Failed to load agents");
    }
  },
  component: AgentsLayout,
});
