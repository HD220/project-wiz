import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import { ProjectDto } from "@/shared/types";

import { ProjectActivityGrid } from "./project-activity-grid";
import { ProjectHeader } from "./project-header";
import { ProjectStatsGrid } from "./project-stats-grid";

import { useProjects } from "@/domains/projects/hooks/use-projects.hook";

export function ProjectIndexPage() {
  const { projectId } = Route.useParams();
  const [currentProject, setCurrentProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { getProjectById } = useProjects();

  useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        setIsLoading(true);
        const project = await getProjectById({ id: projectId });
        setCurrentProject(project);
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, getProjectById]);

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
