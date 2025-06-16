// src/core/domain/entities/agent/persona-template.types.ts
export interface AgentPersonaTemplate {
  id: string; // Unique identifier for the template
  role: string;
  goal: string;
  backstory: string;
  toolNames: string[]; // List of tool names/IDs this persona uses
}
