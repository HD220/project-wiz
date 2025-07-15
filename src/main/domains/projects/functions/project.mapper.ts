import { ProjectDto } from "../../../../shared/types/project.types";

export function projectToDto(project: any): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    gitUrl: project.gitUrl,
    status: project.status,
    avatar: project.avatar,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    unreadCount: 0,
    lastActivity: project.updatedAt.toISOString(),
  };
}
