import type { CreateAgentInput, Agent } from "../../../../shared/types/common";
import { BaseApiClient } from "../../../services/api-client";

export class AgentApiService extends BaseApiClient {
  static async createAgent(data: CreateAgentInput): Promise<Agent> {
    const response = await window.electronAPI.createAgent(data);
    return this.handleResponse(response, "Failed to create agent");
  }

  static async findAgentById(agentId: string): Promise<Agent | null> {
    const response = await window.electronAPI.findAgentById(agentId);
    return this.handleResponse(response, "Failed to find agent");
  }

  static async findAgentsByCreator(creatorId: string): Promise<Agent[]> {
    const response = await window.electronAPI.findAgentsByCreator(creatorId);
    return this.handleResponse(response, "Failed to find agents");
  }

  static async findProjectAgents(projectId: string): Promise<Agent[]> {
    const response = await window.electronAPI.findProjectAgents(projectId);
    return this.handleResponse(response, "Failed to find project agents");
  }

  static async getAvailableAgents(userId: string): Promise<Agent[]> {
    const response = await window.electronAPI.getAvailableAgents(userId);
    return this.handleResponse(response, "Failed to get available agents");
  }

  static async updateAgent(data: {
    agentId: string;
    input: Partial<CreateAgentInput>;
    userId: string;
  }): Promise<Agent> {
    const response = await window.electronAPI.updateAgent(data);
    return this.handleResponse(response, "Failed to update agent");
  }

  static async updateAgentStatus(data: {
    agentId: string;
    status: string;
  }): Promise<void> {
    const response = await window.electronAPI.updateAgentStatus(data);
    return this.handleResponse(response, "Failed to update agent status");
  }

  static async deleteAgent(data: {
    agentId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteAgent(data);
    return this.handleResponse(response, "Failed to delete agent");
  }
}
