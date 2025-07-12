import { ProjectData } from "../entities/project.schema";
import {
  ProjectDto,
  CreateProjectDto,
} from "../../../../shared/types/project.types";

export class ProjectMapper {
  toDto(project: ProjectData): ProjectDto {
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

  fromDto(dto: CreateProjectDto): Partial<ProjectData> {
    return {
      name: dto.name,
      description: dto.description,
      gitUrl: dto.gitUrl,
      avatar: dto.avatar,
    };
  }
}
