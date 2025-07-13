import { AgentRepository } from "../persistence/agent.repository";
import { Agent } from "../domain/agent.entity";
import { AgentMapper } from "../agent.mapper";
import { LlmProviderService } from "../../llm-provider/application/llm-provider.service";
import type { CreateAgentDto, UpdateAgentDto, AgentFilterDto } from "../../../../shared/types/agent.types";

export { CreateAgentDto, UpdateAgentDto, AgentFilterDto };

export class AgentService {
  constructor(
    private repository: AgentRepository,
    private mapper: AgentMapper,
    private llmProviderService: LlmProviderService,
  ) {}

  async createAgent(data: CreateAgentDto): Promise<Agent> {
    // Validate LLM provider exists
    const llmProvider = await this.llmProviderService.getLlmProviderById(data.llmProviderId);
    if (!llmProvider) {
      throw new Error("LLM Provider não encontrado");
    }

    // Check if agent already exists with this name
    const existingAgent = await this.repository.findByName(data.name);
    if (existingAgent) {
      throw new Error("Já existe um agente com este nome");
    }

    // Create agent with default values
    const agentData = {
      name: data.name,
      role: data.role,
      goal: data.goal,
      backstory: data.backstory,
      llmProviderId: data.llmProviderId,
      temperature: data.temperature ?? 0.7,
      maxTokens: data.maxTokens ?? 1000,
      isActive: data.isActive ?? true,
    };

    // Validate agent data
    const validation = Agent.validate(agentData);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Save agent
    const saved = await this.repository.save(agentData);

    return this.mapper.toDomain(saved);
  }

  async getAgentById(id: string): Promise<Agent | null> {
    const schema = await this.repository.findById(id);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async getAgentByName(name: string): Promise<Agent | null> {
    const schema = await this.repository.findByName(name);
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async listAgents(filter?: AgentFilterDto): Promise<Agent[]> {
    const schemas = await this.repository.findMany(filter);
    return schemas.map(schema => this.mapper.toDomain(schema));
  }

  async getActiveAgents(): Promise<Agent[]> {
    const schemas = await this.repository.findActiveAgents();
    return schemas.map(schema => this.mapper.toDomain(schema));
  }

  async updateAgent(data: UpdateAgentDto): Promise<Agent> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Agente não encontrado");
    }

    // Validate LLM provider if being updated
    if (data.llmProviderId) {
      const llmProvider = await this.llmProviderService.getLlmProviderById(data.llmProviderId);
      if (!llmProvider) {
        throw new Error("LLM Provider não encontrado");
      }
    }

    // If name is being updated, check for conflicts
    if (data.name && data.name !== existing.name) {
      const existingByName = await this.repository.findByName(data.name);
      if (existingByName) {
        throw new Error("Já existe um agente com este nome");
      }
    }

    // Update agent
    const updated = await this.repository.update(data.id, {
      name: data.name,
      role: data.role,
      goal: data.goal,
      backstory: data.backstory,
      llmProviderId: data.llmProviderId,
      temperature: data.temperature,
      maxTokens: data.maxTokens,
      isActive: data.isActive,
    });

    return this.mapper.toDomain(updated);
  }

  async deleteAgent(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Agente não encontrado");
    }

    await this.repository.delete(id);
  }

  async activateAgent(id: string): Promise<Agent> {
    return this.updateAgent({ id, isActive: true });
  }

  async deactivateAgent(id: string): Promise<Agent> {
    return this.updateAgent({ id, isActive: false });
  }

  async existsByName(name: string): Promise<boolean> {
    return this.repository.existsByName(name);
  }
}