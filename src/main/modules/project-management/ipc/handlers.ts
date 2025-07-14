import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ProjectService } from "../application/project.service";
import { ProjectMapper } from "../project.mapper";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  ProjectDto,
} from "../../../../shared/types/project.types";

export class ProjectIpcHandlers {
  constructor(
    private projectService: ProjectService,
    private projectMapper: ProjectMapper,
  ) {}

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
      const projectData = { ...data, status: data.status || "active" };
      const project = await this.projectService.createProject(projectData);
      return this.projectMapper.toDto(project);
    } catch (error) {
      throw new Error(`Failed to create project: ${(error as Error).message}`);
    }
  }

  private async handleListProjects(
    event: IpcMainInvokeEvent,
    filter?: ProjectFilterDto,
  ): Promise<ProjectDto[]> {
    const projects = await this.projectService.listProjects(filter);
    return projects.map((project) => this.projectMapper.toDto(project));
  }

  private async handleGetProjectById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ProjectDto | null> {
    const project = await this.projectService.getProjectById(data);
    return project ? this.projectMapper.toDto(project) : null;
  }

  private async handleUpdateProject(
    event: IpcMainInvokeEvent,
    data: UpdateProjectDto,
  ): Promise<ProjectDto> {
    const projectData = { ...data, updatedAt: new Date() };
    const project = await this.projectService.updateProject(projectData);
    return this.projectMapper.toDto(project);
  }

  private async handleDeleteProject(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    await this.projectService.deleteProject(data);
  }

  private async handleArchiveProject(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ProjectDto> {
    const project = await this.projectService.archiveProject(data);
    return this.projectMapper.toDto(project);
  }
}
