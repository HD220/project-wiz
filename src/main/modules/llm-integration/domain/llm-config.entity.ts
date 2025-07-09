import { BaseEntity } from "@/shared/common/base.entity";

interface LlmConfigProps {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export class LlmConfig extends BaseEntity<LlmConfigProps> {
  constructor(props: LlmConfigProps, id?: string) {
    super(props, id);
  }

  get provider(): string {
    return this.props.provider;
  }

  get model(): string {
    return this.props.model;
  }

  get apiKey(): string {
    return this.props.apiKey;
  }

  get temperature(): number {
    return this.props.temperature;
  }

  get maxTokens(): number {
    return this.props.maxTokens;
  }

  public updateConfig(updates: Partial<LlmConfigProps>): void {
    Object.assign(this.props, updates);
  }
}
