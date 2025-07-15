import { ipcMain, IpcMainInvokeEvent } from "electron";

import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  ProjectDto,
} from "../../../../shared/types/project.types";
import {
  createProject,
  findAllProjects,
  findProjectById,
  updateProject,
  deleteProject,
  archiveProject,
} from "../../../domains/projects/functions/project.functions";
import { projectToDto } from "../../../domains/projects/functions/project.mapper";

export class ProjectIpcHandlers {
  constructor() {}

  registerHandlers(): void {
    ipcMain.handle("project:create", this.handleCreateProject.bind(this));
    ipcMain.handle("project:list", this.handleListProjects.bind(this));
    ipcMain.handle("project:getById", this.handleGetProjectById.bind(this));
    ipcMain.handle("project:update", this.handleUpdateProject.bind(this));
    ipcMain.handle("project:delete", this.handleDeleteProject.bind(this));
    ipcMain.handle("project:archive", this.handleArchiveProject.bind(this));
  }

  private async handleCreateProject(
    event: IpcMainInvokeEvent,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    try {
      const project = await createProject({
        name: data.name,
        description: data.description,
        gitUrl: data.gitUrl,
      });
      return projectToDto(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${(error as Error).message}`);
    }
  }

  private async handleListProjects(
    event: IpcMainInvokeEvent,
    filter?: ProjectFilterDto,
  ): Promise<ProjectDto[]> {
    const projects = await findAllProjects(filter);
    return projects.map((project: any) => projectToDto(project));
  }

  private async handleGetProjectById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ProjectDto | null> {
    const project = await findProjectById(data.id);
    return project ? projectToDto(project) : null;
  }

  private async handleUpdateProject(
    event: IpcMainInvokeEvent,
    data: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const project = await updateProject({
      id: data.id,
      name: data.name,
      description: data.description,
      gitUrl: data.gitUrl,
    });
    return projectToDto(project);
  }

  private async handleDeleteProject(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    await deleteProject(data.id);
  }

  private async handleArchiveProject(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ProjectDto> {
    const project = await archiveProject(data.id);
    return projectToDto(project);
  }
}
