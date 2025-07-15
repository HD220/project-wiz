import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

export const agentService = {
  async list(): Promise<AgentDto[]> {
    const agents = await window.electronIPC.invoke("agent:list");
    return Array.isArray(agents) ? agents : [];
  },

  async listActive(): Promise<AgentDto[]> {
    const activeAgents = await window.electronIPC.invoke("agent:listActive");
    return Array.isArray(activeAgents) ? activeAgents : [];
  },

  async getById(id: string): Promise<AgentDto | null> {
    return window.electronIPC.invoke("agent:getById", { id });
  },

  async getByName(name: string): Promise<AgentDto | null> {
    return window.electronIPC.invoke("agent:getByName", { name });
  },

  async create(data: Partial<AgentDto>): Promise<AgentDto> {
    return window.electronIPC.invoke("agent:create", data);
  },

  async update(id: string, data: Partial<AgentDto>): Promise<AgentDto> {
    return window.electronIPC.invoke("agent:update", { id, ...data });
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.invoke("agent:delete", { id });
  },
};