import { Agent } from "./agent.entity";
import {
  AgentsRepository,
  CreateAgentData,
  UpdateAgentData,
} from "./agents.repository";

export class AgentsService {
  private repository = new AgentsRepository();

  async createAgent(data: CreateAgentData): Promise<Agent> {
    this.validateAgentName(data.name);
    return this.repository.create(data);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return this.repository.findById(id);
  }

  async getAllAgents(): Promise<Agent[]> {
    return this.repository.findAll();
  }

  async getActiveAgents(): Promise<Agent[]> {
    return this.repository.findActive();
  }

  async updateAgent(id: string, data: UpdateAgentData): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    return this.repository.update(id, data);
  }

  async deleteAgent(id: string): Promise<void> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    return this.repository.delete(id);
  }

  async activateAgent(id: string): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    const activatedAgent = agent.activate();
    return this.repository.update(id, {
      status: activatedAgent.getStatus(),
    });
  }

  async deactivateAgent(id: string): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    const deactivatedAgent = agent.deactivate();
    return this.repository.update(id, {
      status: deactivatedAgent.getStatus(),
    });
  }

  async startWork(id: string): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    const workingAgent = agent.startWork();
    return this.repository.update(id, {
      status: workingAgent.getStatus(),
    });
  }

  async completeWork(id: string): Promise<Agent> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }

    const completedAgent = agent.completeWork();
    return this.repository.update(id, {
      status: completedAgent.getStatus(),
    });
  }

  async getAgentStats() {
    const total = await this.repository.count();
    const active = await this.repository.countActive();

    return {
      total,
      active,
      inactive: total - active,
    };
  }

  private validateAgentName(name: string): void {
    if (name.length < 2) {
      throw new Error("Agent name must be at least 2 characters");
    }
    if (name.length > 100) {
      throw new Error("Agent name must be less than 100 characters");
    }
  }
}
