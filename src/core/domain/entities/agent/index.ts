import { Persona } from "./value-objects/persona";
import { LLMProviderConfig } from "../llm-provider-config";
import { AgentId, AgentTemperature } from "./value-objects";

export type AgentConstructor = {
  id: AgentId;
  persona: Persona;
  llmProviderConfig: LLMProviderConfig;
  temperature: AgentTemperature;
};
export class Agent {
  constructor(private readonly fields: AgentConstructor) {}

  get id() {
    return this.fields.id;
  }

  get persona() {
    return this.fields.persona;
  }
  get llmProviderConfig() {
    return this.fields.llmProviderConfig;
  }
  get temperature() {
    return this.fields.temperature;
  }
}
