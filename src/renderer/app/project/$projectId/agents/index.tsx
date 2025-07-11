import { createFileRoute } from "@tanstack/react-router";
import { AgentDashboard } from "@/renderer/features/agent-management/components/agent-dashboard";
import { PageTitle } from "@/components/page-title";
import { Users } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/agents/")({
  component: ProjectAgentsPage,
});

export function ProjectAgentsPage() { // Renamed component
  return (
    <div className="h-full">
      <PageTitle title="Agentes" icon={<Users className="w-5 h-5 text-muted-foreground" />} />
      <AgentDashboard />
    </div>
  );
}
