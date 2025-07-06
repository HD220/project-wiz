// src/core/domain/agent/agent.entity.ts
import { z } from "zod";

import { AbstractEntity, EntityProps } from "@/core/common/base.entity";

import { EntityError } from "@/domain/common/errors";

import { LLMProviderConfig } from "../llm-provider-config/llm-provider-config.entity";

import { AgentPersonaTemplate } from "./agent-persona-template.vo";
import { AgentId } from "./value-objects/agent-id.vo";
import { AgentMaxIterations } from "./value-objects/agent-max-iterations.vo";
import { AgentTemperature } from "./value-objects/agent-temperature.vo";

export interface AgentProps {
  id: AgentId;
  personaTemplate: AgentPersonaTemplate;
  llmProviderConfig: LLMProviderConfig;
  temperature: AgentTemperature;
  maxIterations: AgentMaxIterations;
  createdAt?: Date;
  updatedAt?: Date;
}

const AgentPropsSchema = z.object({
  id: z.custom<AgentId>((val) => val instanceof AgentId),
  personaTemplate: z.custom<AgentPersonaTemplate>(
    (val) => val instanceof AgentPersonaTemplate
  ),
  llmProviderConfig: z.custom<LLMProviderConfig>(
    (val) => val instanceof LLMProviderConfig
  ),
  temperature: z.custom<AgentTemperature>(
    (val) => val instanceof AgentTemperature
  ),
  maxIterations: z.custom<AgentMaxIterations>(
    (val) => val instanceof AgentMaxIterations
  ),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

interface InternalAgentProps extends EntityProps<AgentId> {
  personaTemplate: AgentPersonaTemplate;
  llmProviderConfig: LLMProviderConfig;
  temperature: AgentTemperature;
  maxIterations: AgentMaxIterations;
  createdAt: Date;
  updatedAt: Date;
}

export class Agent extends AbstractEntity<AgentId, InternalAgentProps> {
  private constructor(props: InternalAgentProps) {
    super(props);
  }

  public static create(props: AgentProps): Agent {
    const validationResult = AgentPropsSchema.safeParse(props);
    if (!validationResult.success) {
      const errorMessages = Object.values(
        validationResult.error.flatten().fieldErrors
      )
        .flat()
        .join("; ");
      throw new EntityError(`Invalid Agent props: ${errorMessages}`, {
        details: validationResult.error.flatten().fieldErrors,
      });
    }

    const now = new Date();
    const internalProps: InternalAgentProps = {
      id: props.id || AgentId.generate(),
      personaTemplate: props.personaTemplate,
      llmProviderConfig: props.llmProviderConfig,
      temperature: props.temperature || AgentTemperature.default(),
      maxIterations: props.maxIterations || AgentMaxIterations.default(),
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };

    return new Agent(internalProps);
  }

  public get personaTemplate(): AgentPersonaTemplate {
    return this.props.personaTemplate;
  }

  public get llmProviderConfig(): LLMProviderConfig {
    return this.props.llmProviderConfig;
  }

  public get temperature(): AgentTemperature {
    return this.props.temperature;
  }

  public get maxIterations(): AgentMaxIterations {
    return this.props.maxIterations;
  }

  // Behavior methods
  public changeTemperature(newTemperature: AgentTemperature): Agent {
    const newProps = {
      ...this.props,
      temperature: newTemperature,
      updatedAt: new Date(),
    };
    return new Agent(newProps);
  }

  public changeMaxIterations(newMaxIterations: AgentMaxIterations): Agent {
    const newProps = {
      ...this.props,
      maxIterations: newMaxIterations,
      updatedAt: new Date(),
    };
    return new Agent(newProps);
  }

  public assignNewLLMConfig(newConfig: LLMProviderConfig): Agent {
    const newProps = {
      ...this.props,
      llmProviderConfig: newConfig,
      updatedAt: new Date(),
    };
    return new Agent(newProps);
  }
}
