import { createFileRoute } from "@tanstack/react-router";

import { useProject } from "@/domains/projects/hooks";

import { ProjectActivityGrid } from "./project-activity-grid";
import { ProjectHeader } from "./project-header";
import { ProjectStatsGrid } from "./project-stats-grid";

export function ProjectIndexPage() {
  const { projectId } = Route.useParams();
  const { project: currentProject, isLoading } = useProject(projectId);

  if (isLoading) {
    return <div className="p-4">Carregando projeto...</div>;
  }

  if (!currentProject) {
    return <div className="p-4">Projeto não encontrado.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <ProjectHeader project={currentProject} />
      <ProjectStatsGrid />
      <ProjectActivityGrid />
    </div>
  );
}

export const Route = createFileRoute("/project/$projectId/")({
  component: ProjectIndexPage,
});
