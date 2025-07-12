import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/renderer/features/agent-management/components/agent-dashboard";

export const Route = createFileRoute("/project/$projectId/agents/")({
  component: ProjectAgentsPage,
});

export function ProjectAgentsPage() {
  return (
    <div className="h-full overflow-auto">
      <AgentDashboard />
    </div>
  );
}
