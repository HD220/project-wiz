// src_refactored/core/domain/agent/agent.entity.ts
import { LLMProviderConfig } from '../llm-provider-config/llm-provider-config.entity';

import { AgentPersonaTemplate } from './agent-persona-template.vo';
import { AgentId } from './value-objects/agent-id.vo';
import { AgentMaxIterations } from './value-objects/agent-max-iterations.vo';
import { AgentTemperature } from './value-objects/agent-temperature.vo';

// Properties an Agent entity holds.
// For strict Object Calisthenics (max 2 instance vars), these are grouped.
interface AgentProps {
  personaTemplate: AgentPersonaTemplate;
  llmProviderConfig: LLMProviderConfig;
  temperature: AgentTemperature;
  maxIterations: AgentMaxIterations;
  // Optional: Link to a persisted AgentInternalStateId if state is managed separately
  // agentInternalStateId?: AgentInternalStateId;
  // createdAt: Date;
  // updatedAt: Date;
}

export class Agent {
  private readonly _id: AgentId; // Instance variable 1: Identity
  private readonly props: Readonly<AgentProps>; // Instance variable 2: Other properties

  private constructor(id: AgentId, props: AgentProps) {
    this._id = id;
    this.props = Object.freeze(props);
  }

  public static create(createProps: {
    id?: AgentId;
    personaTemplate: AgentPersonaTemplate;
    llmProviderConfig: LLMProviderConfig;
    temperature?: AgentTemperature;
    maxIterations?: AgentMaxIterations;
  }): Agent {
    const agentId = createProps.id || AgentId.generate();
    const temperature = createProps.temperature || AgentTemperature.default();
    const maxIterations = createProps.maxIterations || AgentMaxIterations.default();

    // Perform any validation specific to the combination of persona and LLM config if needed
    // For example, ensure tools required by persona are compatible with LLM or provider capabilities (future)

    return new Agent(agentId, {
      personaTemplate: createProps.personaTemplate,
      llmProviderConfig: createProps.llmProviderConfig,
      temperature: temperature,
      maxIterations: maxIterations,
      // createdAt: new Date(),
      // updatedAt: new Date(),
    });
  }

  public id(): AgentId {
    return this._id;
  }

  public personaTemplate(): AgentPersonaTemplate {
    return this.props.personaTemplate;
  }

  public llmProviderConfig(): LLMProviderConfig {
    return this.props.llmProviderConfig;
  }

  public temperature(): AgentTemperature {
    return this.props.temperature;
  }

  public maxIterations(): AgentMaxIterations {
    return this.props.maxIterations;
  }

  // Behavior methods
  public changeTemperature(newTemperature: AgentTemperature): Agent {
    return new Agent(this._id, {
      ...this.props,
      temperature: newTemperature,
      // updatedAt: new Date(),
    });
  }

  public changeMaxIterations(newMaxIterations: AgentMaxIterations): Agent {
    return new Agent(this._id, {
      ...this.props,
      maxIterations: newMaxIterations,
      // updatedAt: new Date(),
    });
  }

  // Potentially, a method to update the LLMProviderConfig if that's a dynamic behavior
  public assignNewLLMConfig(newConfig: LLMProviderConfig): Agent {
     return new Agent(this._id, {
      ...this.props,
      llmProviderConfig: newConfig,
      // updatedAt: new Date(),
    });
  }

  public equals(other?: Agent): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (!(other instanceof Agent)) {
      return false;
    }
    return this._id.equals(other._id);
  }
}
