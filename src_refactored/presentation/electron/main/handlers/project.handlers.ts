import { ipcMain } from "electron";

import {
  IPC_CHANNELS
} from "../../../../shared/ipc-channels";
import {
  GetProjectDetailsRequest,
  GetProjectDetailsResponseData,
  GetProjectsListResponseData,
  CreateProjectRequest,
  CreateProjectResponseData,
  UpdateProjectRequest,
  UpdateProjectResponseData,
} from "../../../../shared/ipc-types";
import { Project } from "../../../../shared/types/entities";
import { AgentLLM, LLMConfig } from "../../../../shared/types/entities";
import {
  mockProjectsDb,
  addMockProject,
  updateMockProject,
} from "../mocks/project.mocks";

function registerQueryProjectHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.GET_PROJECTS_LIST,
    async (): Promise<GetProjectsListResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return { projects: mockProjectsDb };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.GET_PROJECT_DETAILS,
    async (
      _event,
      req: GetProjectDetailsRequest
    ): Promise<GetProjectDetailsResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const projectDetails = mockProjectsDb.find(
        (project) => project.id === req.projectId
      );
      if (projectDetails) {
        return { project: projectDetails };
      }
      return { project: undefined, error: "Project not found" };
    }
  );
}

function registerMutationProjectHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.CREATE_PROJECT,
    async (
      _event,
      req: CreateProjectRequest
    ): Promise<CreateProjectResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: req.name,
        description: req.description ?? undefined,
        platformUrl: req.platformUrl ?? undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        projectManager: "user-123",
        teamMembers: ["user-123"],
        status: "active",
        version: "1.0.0",
        repositoryUrl: req.repositoryUrl ?? undefined,
        tags: req.tags ?? [],
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
    IPC_CHANNELS.UPDATE_PROJECT,
    async (
      _event,
      req: UpdateProjectRequest
    ): Promise<UpdateProjectResponseData> => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const updatedProject = updateMockProject(req.projectId, req.updates);
      if (updatedProject) {
        return { project: updatedProject };
      }
      return { project: undefined, error: "Project not found for update" };
    }
  );
}

export function registerProjectHandlers() {
  registerQueryProjectHandlers();
  registerMutationProjectHandlers();
}
