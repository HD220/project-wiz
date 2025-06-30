// src_refactored/infrastructure/persistence/in-memory/repositories/agent-persona-template.repository.ts
import { injectable } from 'inversify';

import { AgentPersonaTemplateVO } from '@/core/domain/agent/agent-persona-template.vo'; // Corrected import and type
import { IAgentPersonaTemplateRepository } from '@/core/domain/agent/ports/agent-persona-template-repository.interface';
import { PersonaIdVO } from '@/core/domain/agent/value-objects/persona/persona-id.vo'; // Corrected import and type

import { Result, Ok, Err } from '@/shared/result';


@injectable()
export class InMemoryAgentPersonaTemplateRepository implements IAgentPersonaTemplateRepository {
  private readonly templates: Map<string, AgentPersonaTemplateVO> = new Map();

  async save(template: AgentPersonaTemplateVO): Promise<Result<void, Error>> {
    this.templates.set(template.id.value, template); // Assuming AgentPersonaTemplateVO has an 'id' of type PersonaIdVO
    return Ok(undefined);
  }

  async findById(id: PersonaIdVO): Promise<Result<AgentPersonaTemplateVO | null, Error>> {
    const template = this.templates.get(id.value);
    return Ok(template || null);
  }

  async findAll(): Promise<Result<AgentPersonaTemplateVO[], Error>> {
    return Ok(Array.from(this.templates.values()));
  }

  async delete(id: PersonaIdVO): Promise<Result<void, Error>> {
    if (!this.templates.has(id.value)) {
      return Err(new Error(`Template with ID ${id.value} not found.`));
    }
    this.templates.delete(id.value);
    return Ok(undefined);
  }
}
