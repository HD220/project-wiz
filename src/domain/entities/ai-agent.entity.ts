// src/domain/entities/ai-agent.entity.ts
import { randomUUID } from 'crypto';

// Using an interface for props, similar to JobProps
export interface AIAgentProps {
  id: string;
  name: string;
  roleDescription: string; // For the system prompt
  modelId: string; // Provider-prefixed model ID, e.g., "openai/gpt-4-turbo", "anthropic/claude-3-opus". Also used for custom models registered with the provider registry.
  provider: string; // DEPRECATED if modelId is provider-prefixed. Kept for now for compatibility or specific provider logic if needed.
  temperature?: number; // LLM temperature
  availableTools: string[]; // List of tool names available to this agent
  // queueName: string; // REMOVED - Agent ID will be used as queue name
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
    // queueName: string; // REMOVED from params
  }): AIAgent {
    const now = new Date();
    const id = params.id || `agent-${randomUUID()}`; // randomUUID needs to be imported

    return new AIAgent({
      id,
      name: params.name,
      roleDescription: params.roleDescription,
      modelId: params.modelId,
      provider: params.provider, // Keep or remove based on modelId strategy
      temperature: params.temperature ?? 0.7, // Default temperature
      availableTools: params.availableTools || [],
      // queueName: params.queueName, // REMOVED from props assignment
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
  // get queueName(): string { return this.props.queueName; } // REMOVED

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
