import { Loader2 } from "lucide-react";
import type { ProjectDto } from "../../../../shared/types/domains/projects/project.types";

interface ProjectAvatarProps {
  project: ProjectDto;
  isLoading: boolean;
}

export function ProjectAvatar({ project, isLoading }: ProjectAvatarProps) {
  if (isLoading) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  }

  if (project.avatar) {
    return (
      <img
        src={project.avatar}
        alt={project.name}
        className="w-8 h-8 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="text-sm font-semibold text-foreground [.active_&]:text-primary-foreground">
      {project.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
