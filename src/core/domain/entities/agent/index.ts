import { Persona } from "./value-objects/persona";
import { LLMProviderConfig } from "../llm-provider-config";
import { AgentId, AgentTemperature } from "./value-objects";

export type AgentConstructor = {
  id: AgentId;
  persona: Persona;
  llmProviderConfig: LLMProviderConfig;
  temperature: AgentTemperature;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class Agent {
  private constructor(private readonly fields: AgentConstructor) { // Changed to private
    if (
      !fields.id ||
      !fields.persona ||
      !fields.llmProviderConfig ||
      !fields.temperature
    ) {
      throw new Error( // Consider DomainError here
        "Agent ID, Persona, LLMProviderConfig, and Temperature are mandatory."
      );
    }
  }

  public static create(props: AgentConstructor): Agent {
    // Validation is in the constructor, but could also be here.
    // This static create method becomes the public point of instantiation.
    if (!props.id || !props.persona || !props.llmProviderConfig || !props.temperature) {
        // Duplicates constructor validation, but good for fail-fast if constructor becomes truly minimal
        throw new Error("Agent ID, Persona, LLMProviderConfig, and Temperature are mandatory for creation.");
    }
    return new Agent(props);
  }

  public id(): AgentId {
    return this.fields.id;
  }

  public getProps(): Readonly<AgentConstructor> {
    // Persona and LLMProviderConfig are complex objects (entities/aggregates).
    // Returning them directly is fine as their state is also managed by VOs / getProps.
    return { ...this.fields };
  }

  // Individual getters removed.

  public equals(other?: Agent): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof Agent)) return false;

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.persona.equals(other.fields.persona) && // Assumes Persona has .equals()
      this.fields.llmProviderConfig.equals(other.fields.llmProviderConfig) && // Assumes LLMProviderConfig has .equals()
      this.fields.temperature.equals(other.fields.temperature)
    );
  }

  public changeTemperature(newTemperature: AgentTemperature): Agent {
    return new Agent({ ...this.fields, temperature: newTemperature });
  }
}
