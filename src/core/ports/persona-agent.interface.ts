// src/core/ports/persona-agent.interface.ts
import { IAgent } from './agent.interface';
import { AgentPersona } from '../domain/entities/agent/persona.types';

/**
 * Represents an Agent that has a defined Persona.
 * Extends the generic IAgent interface.
 */
export interface IPersonaAgent<PInput = any, POutput = any> extends IAgent<PInput, POutput> {
  readonly persona: AgentPersona;
  // The 'name' property from IAgent could potentially be derived from persona.role or be distinct.
  // For now, IAgent already has 'name', so it will be inherited.
}
