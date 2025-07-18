import { createFileRoute } from "@tanstack/react-router";

import { AgentDashboard } from "@/domains/agents/components";

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
