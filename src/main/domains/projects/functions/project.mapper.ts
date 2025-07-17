import { ProjectDto } from "@/shared/types";
import { ProjectSchema } from "@/main/persistence/schemas/projects.schema";

export function projectToDto(project: ProjectSchema): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description || undefined,
    gitUrl: project.gitUrl || undefined,
    status: project.status,
    avatar: project.avatar || undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    unreadCount: 0,
    lastActivity: project.updatedAt.toISOString(),
  };
}
