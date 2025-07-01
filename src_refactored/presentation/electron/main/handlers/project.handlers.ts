import { ipcMain } from "electron";

import {
  GET_PROJECTS_CHANNEL,
  GET_PROJECT_DETAILS_CHANNEL,
  CREATE_PROJECT_CHANNEL,
  UPDATE_PROJECT_CHANNEL,
  // DELETE_PROJECT_CHANNEL, // Example for later
} from "../../../../shared/ipc-channels";
import {
  GetProjectDetailsRequest,
  GetProjectDetailsResponse,
  GetProjectsResponse,
  CreateProjectRequest,
  CreateProjectResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
} from "../../../../shared/ipc-types/project";
import { Project } from "../../../../shared/types/entities";
import { AgentLLM } from "../../../../shared/types/entities";
import {
  mockProjects,
  addMockProject,
  updateMockProject,
} from "../mocks/project.mocks";

export function registerProjectHandlers() {
  ipcMain.handle(
    GET_PROJECTS_CHANNEL,
    async (): Promise<GetProjectsResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { projects: mockProjects };
    }
  );

  ipcMain.handle(
    GET_PROJECT_DETAILS_CHANNEL,
    async (
      _event,
      req: GetProjectDetailsRequest
    ): Promise<GetProjectDetailsResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const project = mockProjects.find((p) => p.id === req.projectId);
      if (project) {
        return { project };
      }
      return { project: undefined, error: "Project not found" };
    }
  );

  ipcMain.handle(
    CREATE_PROJECT_CHANNEL,
    async (
      _event,
      req: CreateProjectRequest
    ): Promise<CreateProjectResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: req.name,
        description: req.description,
        platformUrl: req.platformUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectManager: "user-123",
        teamMembers: ["user-123"],
        status: "active",
        version: "1.0.0",
        repositoryUrl: req.repositoryUrl,
        tags: req.tags || [],
        llmConfig: req.llmConfig || {
          llm: AgentLLM.OPENAI_GPT_4_TURBO,
          temperature: 0.7,
          maxTokens: 2048,
        },
        // agentInstances: [], // Assuming this might be populated later or via another mechanism
      };
      addMockProject(newProject);
      return { project: newProject };
    }
  );

  ipcMain.handle(
    UPDATE_PROJECT_CHANNEL,
    async (
      _event,
      req: UpdateProjectRequest
    ): Promise<UpdateProjectResponse> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const updatedProject = updateMockProject(req.projectId, req.updates);
      if (updatedProject) {
        return { project: updatedProject };
      }
      return { project: undefined, error: "Project not found for update" };
    }
  );
}
