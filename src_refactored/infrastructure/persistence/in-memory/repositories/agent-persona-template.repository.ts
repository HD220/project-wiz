// src_refactored/infrastructure/persistence/in-memory/repositories/agent-persona-template.repository.ts
import { injectable } from 'inversify';

import { AgentPersonaTemplate } from '@/core/domain/agent/agent-persona-template.entity';
import { IAgentPersonaTemplateRepository } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { AgentPersonaTemplateId } from '@/core/domain/agent/value-objects/agent-persona-template-id.vo';

import { Result, Ok, Err } from '@/shared/result';


@injectable()
export class InMemoryAgentPersonaTemplateRepository implements IAgentPersonaTemplateRepository {
  private readonly templates: Map<string, AgentPersonaTemplate> = new Map();

  async save(template: AgentPersonaTemplate): Promise<Result<void, Error>> {
    this.templates.set(template.id.value, template);
    return Ok(undefined);
  }

  async findById(id: AgentPersonaTemplateId): Promise<Result<AgentPersonaTemplate | null, Error>> {
    const template = this.templates.get(id.value);
    return Ok(template || null);
  }

  async findAll(): Promise<Result<AgentPersonaTemplate[], Error>> {
    return Ok(Array.from(this.templates.values()));
  }

  async delete(id: AgentPersonaTemplateId): Promise<Result<void, Error>> {
    if (!this.templates.has(id.value)) {
      return Err(new Error(`Template with ID ${id.value} not found.`));
    }
    this.templates.delete(id.value);
    return Ok(undefined);
  }
}
