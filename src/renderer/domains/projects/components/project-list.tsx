import { useProjects } from "../hooks/use-projects.hook";
import { ProjectCard } from "./project-card";
import { ProjectListSkeleton } from "./project-list-skeleton";
import { ProjectListError } from "./project-list-error";

export function ProjectList() {
  const { projects, isLoading, error, refreshProjects } = useProjects({
    status: "active",
  });

  if (isLoading) return <ProjectListSkeleton />;
  if (error)
    return <ProjectListError error={error} onRetry={refreshProjects} />;

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum projeto encontrado
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
