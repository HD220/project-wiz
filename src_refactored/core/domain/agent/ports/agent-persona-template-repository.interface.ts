// src_refactored/core/domain/agent/ports/agent-persona-template-repository.interface.ts

import { AgentPersonaTemplate } from '../agent-persona-template.vo';
import { PersonaId } from '../value-objects/persona/persona-id.vo';
import { PersonaRole } from '../value-objects/persona/persona-role.vo';

export interface IAgentPersonaTemplateRepository {
  // Save might be for future use if templates are stored in DB,
  // or for validating/caching file-based templates.
  save(template: AgentPersonaTemplate): Promise<void>;

  findById(id: PersonaId): Promise<AgentPersonaTemplate | null>;
  findByRole(role: PersonaRole): Promise<AgentPersonaTemplate | null>;
  findAll(): Promise<AgentPersonaTemplate[]>;

  // Delete might not be applicable for file-based templates managed outside the app's direct DB.
  
}
