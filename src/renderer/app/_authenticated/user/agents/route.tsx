import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { AgentList } from "@/renderer/features/agent/components/agent-list";
import { useAgentStore } from "@/renderer/features/agent/agent.store";

function AgentsLayout() {
  const { loadAgents } = useAgentStore();

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

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

export const Route = createFileRoute(
  "/_authenticated/user/agents",
)({
  component: AgentsLayout,
});