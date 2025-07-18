import { ipcRenderer } from "electron";

import type {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
} from "../../../shared/types/domains/projects/project.types";

export interface IProjectAPI {
  create: (data: CreateProjectDto) => Promise<ProjectDto>;
  getById: (id: string) => Promise<ProjectDto | null>;
  list: (filter?: ProjectFilterDto) => Promise<ProjectDto[]>;
  update: (data: UpdateProjectDto) => Promise<ProjectDto>;
  delete: (id: string) => Promise<void>;
  archive: (id: string) => Promise<ProjectDto>;
}

export function createProjectAPI(): IProjectAPI {
  return {
    create: createProject,
    getById: getProjectById,
    list: listProjects,
    update: updateProject,
    delete: deleteProject,
    archive: archiveProject,
  };
}

function createProject(data: CreateProjectDto): Promise<ProjectDto> {
  return ipcRenderer.invoke("project:create", data);
}

function getProjectById(id: string): Promise<ProjectDto | null> {
  return ipcRenderer.invoke("project:getById", { id });
}

function listProjects(filter?: ProjectFilterDto): Promise<ProjectDto[]> {
  return ipcRenderer.invoke("project:list", filter);
}

function updateProject(data: UpdateProjectDto): Promise<ProjectDto> {
  return ipcRenderer.invoke("project:update", data);
}

function deleteProject(id: string): Promise<void> {
  return ipcRenderer.invoke("project:delete", { id });
}

function archiveProject(id: string): Promise<ProjectDto> {
  return ipcRenderer.invoke("project:archive", { id });
}
