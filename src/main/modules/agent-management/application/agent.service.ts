import { Agent } from "../domain/agent.entity";
import { AgentMapper } from "../agent.mapper";
import { EventBus } from "../../../kernel/event-bus";
import { AgentCreatedEvent, AgentUpdatedEvent, AgentDeletedEvent } from "../../../kernel/events";
import { IAgentRepository, ILlmProviderService, IAgentService } from "../../../interfaces";
import { NotFoundError, ValidationError, DomainError } from "../../../errors";
import type { CreateAgentDto, UpdateAgentDto, AgentFilterDto } from "../../../../shared/types/agent.types";

export { CreateAgentDto, UpdateAgentDto, AgentFilterDto };

export class AgentService implements IAgentService {
  private eventBus: EventBus;

  constructor(
    private repository: IAgentRepository,
    private mapper: AgentMapper,
    private llmProviderService: ILlmProviderService,
  ) {
    this.eventBus = EventBus.getInstance();
  }

  async createAgent(data: CreateAgentDto): Promise<Agent> {
    // Validate LLM provider exists
    const llmProvider = await this.llmProviderService.getLlmProviderById(data.llmProviderId);
    if (!llmProvider) {
      throw NotFoundError.entityNotFound('LLM Provider', data.llmProviderId);
    }

    // Check if agent already exists with this name
    const existingAgent = await this.repository.findByName(data.name);
    if (existingAgent) {
      throw DomainError.invalidBusinessRule(
        'Agent name must be unique', 
        { name: data.name, existingAgentId: existingAgent.id }
      );
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
      throw ValidationError.singleField('agent', validation.error);
    }

    // Save agent
    const saved = await this.repository.save(agentData);
    const agent = this.mapper.toDomain(saved);
    
    // Publish agent created event
    await this.eventBus.publish(new AgentCreatedEvent(saved.id, {
      name: saved.name,
      role: saved.role,
      goal: saved.goal,
      backstory: saved.backstory,
      llmProviderId: saved.llmProviderId,
    }));
    
    return agent;
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