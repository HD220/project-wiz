import { ipcMain } from "electron";

import { GetAllProjectsUseCase } from "@/core/application/use-cases/get-all-projects.use-case";
import { IProjectRepository } from "@/core/domain/repositories/project.repository";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import { GetProjectDetailsRequest, CreateProjectRequest, UpdateProjectRequest, Project } from "@/shared/ipc-types";

function registerQueryProjectHandlers(projectRepository: IProjectRepository) {
  const getAllProjectsUseCase = new GetAllProjectsUseCase(projectRepository);

  ipcMain.handle(
    IPC_CHANNELS.GET_PROJECTS_LIST,
    async (): Promise<Project[]> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return getAllProjectsUseCase.execute();
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_PROJECT_DETAILS,
    async (
      _event,
      req: GetProjectDetailsRequest
    ): Promise<Project | null> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const projectDetails = await projectRepository.getProjectById(req.projectId);
      if (projectDetails) {
        return projectDetails;
      }
      throw new Error("Project not found");
    }
  );
}

function registerMutationProjectHandlers(projectRepository: IProjectRepository) {

  ipcMain.handle(
    IPC_CHANNELS.CREATE_PROJECT,
    async (
      _event,
      req: CreateProjectRequest
    ): Promise<Project> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const newProject = await projectRepository.createProject(req);
      return newProject;
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.UPDATE_PROJECT,
    async (
      _event,
      req: UpdateProjectRequest
    ): Promise<Project> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const updatedProject = await projectRepository.updateProject(req.projectId, req.data);
      if (updatedProject) {
        return updatedProject;
      }
      throw new Error("Project not found for update");
    }
  );
}

export function registerProjectHandlers(projectRepository: IProjectRepository) {
  registerQueryProjectHandlers(projectRepository);
  registerMutationProjectHandlers(projectRepository);
}
