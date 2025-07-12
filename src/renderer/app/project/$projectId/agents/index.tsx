import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/renderer/features/agent-management/components/agent-dashboard";
import { PageTitle } from "@/components/page-title";
import { Users } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/agents/")({
  component: ProjectAgentsPage,
});

export function ProjectAgentsPage() {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <AgentDashboard />
      </div>
    </div>
  );
}
