import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/renderer/features/agent-management/components/agent-dashboard";

export const Route = createFileRoute("/agents")({
  component: AgentsComponent,
});

function AgentsComponent() {
  return (
    <div className="flex-1 overflow-hidden">
      <AgentDashboard />
    </div>
  );
}
