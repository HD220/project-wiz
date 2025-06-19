// src/domain/entities/ai-agent.entity.ts
import { randomUUID } from 'crypto';

// Using an interface for props, similar to JobProps
export interface AIAgentProps {
  id: string;
  name: string;
  roleDescription: string; // For the system prompt
  modelId: string; // e.g., 'deepseek-coder', 'gpt-4-turbo'
  provider: string; // e.g., 'deepseek', 'openai'
  temperature?: number; // LLM temperature
  availableTools: string[]; // List of tool names available to this agent
  queueName: string; // The specific queue this agent listens to
  createdAt: Date;
  updatedAt: Date;
}

export class AIAgent {
  public readonly props: AIAgentProps;

  private constructor(props: AIAgentProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string;
    name: string;
    roleDescription: string;
    modelId: string;
    provider: string;
    temperature?: number;
    availableTools?: string[];
    queueName: string; // Must be provided during creation
  }): AIAgent {
    const now = new Date();
    const id = params.id || `agent-${randomUUID()}`;

    return new AIAgent({
      id,
      name: params.name,
      roleDescription: params.roleDescription,
      modelId: params.modelId,
      provider: params.provider,
      temperature: params.temperature ?? 0.7, // Default temperature
      availableTools: params.availableTools || [],
      queueName: params.queueName,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Getters for convenience
  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get roleDescription(): string { return this.props.roleDescription; }
  get modelId(): string { return this.props.modelId; }
  get provider(): string { return this.props.provider; }
  get temperature(): number | undefined { return this.props.temperature; }
  get availableTools(): string[] { return this.props.availableTools; }
  get queueName(): string { return this.props.queueName; }

  // Example of a method to update certain properties, returning a new instance (immutable pattern)
  public updateSettings(params: {
    name?: string;
    roleDescription?: string;
    modelId?: string;
    provider?: string;
    temperature?: number;
    availableTools?: string[];
  }): AIAgent {
    return new AIAgent({
      ...this.props,
      name: params.name ?? this.props.name,
      roleDescription: params.roleDescription ?? this.props.roleDescription,
      modelId: params.modelId ?? this.props.modelId,
      provider: params.provider ?? this.props.provider,
      temperature: params.temperature ?? this.props.temperature,
      availableTools: params.availableTools ?? this.props.availableTools,
      updatedAt: new Date(),
    });
  }
}
