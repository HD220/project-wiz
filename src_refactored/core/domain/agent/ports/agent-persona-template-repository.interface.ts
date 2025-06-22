// src_refactored/core/domain/agent/ports/agent-persona-template-repository.interface.ts
import { Result } from '../../../../shared/result';
import { AgentPersonaTemplate } from '../agent-persona-template.vo';
import { PersonaId } from '../value-objects/persona/persona-id.vo';
import { PersonaRole } from '../value-objects/persona/persona-role.vo';

export interface IAgentPersonaTemplateRepository {
  // Save might be for future use if templates are stored in DB,
  // or for validating/caching file-based templates.
  save(template: AgentPersonaTemplate): Promise<Result<void>>;

  findById(id: PersonaId): Promise<Result<AgentPersonaTemplate | null>>;
  findByRole(role: PersonaRole): Promise<Result<AgentPersonaTemplate | null>>; // Assuming role is unique for templates
  findAll(): Promise<Result<AgentPersonaTemplate[]>>;

  // Delete might not be applicable for file-based templates managed outside the app's direct DB.
  // delete(id: PersonaId): Promise<Result<void>>;
}
