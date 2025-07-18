import type {
  CreateProjectInput,
  Project,
} from "../../../../shared/types/common";
import { BaseApiClient } from "../../../services/api-client";

export class ProjectApiService extends BaseApiClient {
  static async createProject(data: CreateProjectInput): Promise<Project> {
    const response = await window.electronAPI.createProject(data);
    return this.handleResponse(response, "Failed to create project");
  }

  static async findProjectById(projectId: string): Promise<Project | null> {
    const response = await window.electronAPI.findProjectById(projectId);
    return this.handleResponse(response, "Failed to find project");
  }

  static async findUserProjects(userId: string): Promise<Project[]> {
    const response = await window.electronAPI.findUserProjects(userId);
    return this.handleResponse(response, "Failed to find user projects");
  }

  static async updateProject(data: {
    projectId: string;
    input: Partial<CreateProjectInput>;
    userId: string;
  }): Promise<Project> {
    const response = await window.electronAPI.updateProject(data);
    return this.handleResponse(response, "Failed to update project");
  }

  static async archiveProject(data: {
    projectId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.archiveProject(data);
    return this.handleResponse(response, "Failed to archive project");
  }

  static async deleteProject(data: {
    projectId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteProject(data);
    return this.handleResponse(response, "Failed to delete project");
  }

  static async addAgentToProject(data: {
    projectId: string;
    agentId: string;
    role: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.addAgentToProject(data);
    return this.handleResponse(response, "Failed to add agent to project");
  }

  static async removeAgentFromProject(data: {
    projectId: string;
    agentId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.removeAgentFromProject(data);
    return this.handleResponse(response, "Failed to remove agent from project");
  }
}
