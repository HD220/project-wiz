import {
  ProjectDto,
  CreateProjectDto,
} from "../../../shared/types/project.types";
import { ProjectSchema as ProjectData } from "../../persistence/schemas/projects.schema";

export class ProjectMapper {
  toDto(project: ProjectData): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
      gitUrl: project.gitUrl ?? undefined,
      status: project.status,
      avatar: project.avatar ?? undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      unreadCount: 0,
      lastActivity: project.updatedAt.toISOString(),
    };
  }

  fromDto(dto: CreateProjectDto): Partial<ProjectData> {
    return {
      name: dto.name,
      description: dto.description,
      gitUrl: dto.gitUrl,
      avatar: dto.avatar,
    };
  }
}
