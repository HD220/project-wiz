import { injectable } from "inversify";

import { AgentPersonaTemplate } from "@/core/domain/agent/agent-persona-template.vo";
import { IAgentPersonaTemplateRepository } from "@/core/domain/agent/ports/agent-persona-template-repository.interface";
import { PersonaId } from "@/core/domain/agent/value-objects/persona/persona-id.vo";
import { PersonaRole } from "@/core/domain/agent/value-objects/persona/persona-role.vo";
import { NotFoundError } from "@/core/domain/common/errors";

@injectable()
export class InMemoryAgentPersonaTemplateRepository
  implements IAgentPersonaTemplateRepository
{
  private readonly templates: Map<string, AgentPersonaTemplate> = new Map();

  async save(template: AgentPersonaTemplate): Promise<AgentPersonaTemplate> {
    this.templates.set(template.id.value, template);
    return template;
  }

  async findById(
    id: PersonaId
  ): Promise<AgentPersonaTemplate | null> {
    const template = this.templates.get(id.value);
    return template || null;
  }

  async findByRole(role: PersonaRole): Promise<AgentPersonaTemplate | null> {
    const template = Array.from(this.templates.values()).find(template => template.role.equals(role));
    return template || null;
  }

  async findAll(): Promise<AgentPersonaTemplate[]> {
    return Array.from(this.templates.values());
  }

  async delete(id: PersonaId): Promise<void> {
    if (!this.templates.has(id.value)) {
      throw new NotFoundError("AgentPersonaTemplate", id.value);
    }
    this.templates.delete(id.value);
  }
}