// src/core/ports/repositories/agent-persona-template.repository.ts
import { AgentPersonaTemplate } from '../../domain/entities/agent/persona-template.types';

export interface IAgentPersonaTemplateRepository {
  findById(id: string): Promise<AgentPersonaTemplate | null>;
  findByRole(role: string): Promise<AgentPersonaTemplate | null>;
  // listAll(): Promise<AgentPersonaTemplate[]>; // Optional for listing all available templates
}
