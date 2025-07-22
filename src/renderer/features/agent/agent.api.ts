import type {
  CreateAgentInput,
  SelectAgent,
  AgentStatus,
  AgentWithProvider,
} from "@/renderer/features/agent/agent.types";

export class AgentAPI {
  static async create(input: CreateAgentInput): Promise<SelectAgent> {
    const response = await window.api.agents.create(input);
    if (!response.success) {
      throw new Error(response.error || "Failed to create agent");
    }
    return response.data as SelectAgent;
  }

  static async list(): Promise<SelectAgent[]> {
    const response = await window.api.agents.list();
    if (!response.success) {
      throw new Error(response.error || "Failed to list agents");
    }
    return response.data as SelectAgent[];
  }

  static async getById(id: string): Promise<SelectAgent> {
    const response = await window.api.agents.get(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to get agent");
    }
    return response.data as SelectAgent;
  }

  static async getWithProvider(id: string): Promise<AgentWithProvider> {
    const response = await window.api.agents.getWithProvider(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to get agent with provider");
    }
    return response.data as AgentWithProvider;
  }

  static async update(
    id: string,
    updates: Partial<CreateAgentInput>,
  ): Promise<SelectAgent> {
    const response = await window.api.agents.update(id, updates);
    if (!response.success) {
      throw new Error(response.error || "Failed to update agent");
    }
    return response.data as SelectAgent;
  }

  static async updateStatus(id: string, status: AgentStatus): Promise<void> {
    const response = await window.api.agents.updateStatus(id, status);
    if (!response.success) {
      throw new Error(response.error || "Failed to update agent status");
    }
  }

  static async delete(id: string): Promise<void> {
    const response = await window.api.agents.delete(id);
    if (!response.success) {
      throw new Error(response.error || "Failed to delete agent");
    }
  }
}
