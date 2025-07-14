import { Agent } from "../domain/agent.entity";
import { AgentMapper } from "../agent.mapper";
import { EventBus } from "../../../kernel/event-bus";
import {
  AgentCreatedEvent,
  AgentUpdatedEvent,
  AgentDeletedEvent,
} from "../../../kernel/events";
import {
  IAgentRepository,
  ILlmProviderService,
  IAgentService,
} from "../../../interfaces";
import { NotFoundError, ValidationError, DomainError } from "../../../errors";
import type {
  CreateAgentDto,
  UpdateAgentDto,
  AgentFilterDto,
} from "../../../../shared/types/agent.types";

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
    // Validate LLM provider exists if provided
    if (data.llmProviderId) {
      const llmProvider = await this.llmProviderService.getLlmProviderById(
        data.llmProviderId,
      );
      if (!llmProvider) {
        throw NotFoundError.entityNotFound("LLM Provider", data.llmProviderId);
      }
    }

    // Check if agent already exists with this name
    const existingAgent = await this.repository.findByName(data.name);
    if (existingAgent) {
      throw DomainError.invalidBusinessRule("Agent name must be unique", {
        name: data.name,
        existingAgentId: existingAgent.id,
      });
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
      throw ValidationError.singleField(
        "agent",
        validation.error || "Invalid agent data",
      );
    }

    // Save agent
    const saved = await this.repository.save(agentData);
    const agent = this.mapper.toDomain(saved);

    // Publish agent created event
    await this.eventBus.publish(
      new AgentCreatedEvent(saved.id, {
        id: saved.id,
        name: saved.name,
        role: saved.role,
        goal: saved.goal,
        backstory: saved.backstory,
        llmProviderId: saved.llmProviderId,
      }),
    );

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

  async getAllAgents(filter?: AgentFilterDto): Promise<Agent[]> {
    const schemas = await this.repository.findAll(filter);
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async getActiveAgents(): Promise<Agent[]> {
    const schemas = await this.repository.findAll({ isActive: true });
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }

  async updateAgent(id: string, data: UpdateAgentDto): Promise<Agent> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw NotFoundError.entityNotFound("Agent", id);
    }

    // Validate LLM provider if being updated
    if (data.llmProviderId) {
      const llmProvider = await this.llmProviderService.getLlmProviderById(
        data.llmProviderId,
      );
      if (!llmProvider) {
        throw NotFoundError.entityNotFound("LLM Provider", data.llmProviderId);
      }
    }

    // If name is being updated, check for conflicts
    if (data.name && data.name !== existing.name) {
      const existingByName = await this.repository.findByName(data.name);
      if (existingByName) {
        throw DomainError.invalidBusinessRule("Agent name must be unique", {
          name: data.name,
        });
      }
    }

    // Update agent
    const updated = await this.repository.update(id, {
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

  async activateAgent(id: string): Promise<void> {
    await this.updateAgent(id, { isActive: true });
  }

  async deactivateAgent(id: string): Promise<void> {
    await this.updateAgent(id, { isActive: false });
  }

  async setDefaultAgent(id: string): Promise<void> {
    await this.repository.setDefaultAgent(id);
  }

  async getDefaultAgent(): Promise<Agent | null> {
    const schema = await this.repository.getDefaultAgent();
    return schema ? this.mapper.toDomain(schema) : null;
  }

  async getAgentsByLlmProvider(llmProviderId: string): Promise<Agent[]> {
    const schemas = await this.repository.findByLlmProviderId(llmProviderId);
    return schemas.map((schema) => this.mapper.toDomain(schema));
  }
}
