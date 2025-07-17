import { ProjectDto } from "@/shared/types";
import { ProjectSchema } from "@/main/persistence/schemas/projects.schema";
import { Project, ProjectData } from "../project.entity";

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

export function dbToProjectData(dbData: ProjectSchema): ProjectData {
  return {
    id: dbData.id,
    name: dbData.name,
    description: dbData.description || "",
    gitUrl: dbData.gitUrl,
    status: dbData.status as "active" | "archived" | "maintenance",
    avatar: dbData.avatar,
    createdAt: dbData.createdAt,
    updatedAt: dbData.updatedAt,
  };
}

export function createProjectFromDbData(dbData: ProjectSchema): Project {
  return new Project(dbToProjectData(dbData));
}
