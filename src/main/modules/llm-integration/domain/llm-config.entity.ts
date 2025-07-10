import { BaseEntity } from "@/main/kernel/domain/base.entity";

interface ILlmConfigProps {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

export class LlmConfig extends BaseEntity<ILlmConfigProps> {
  constructor(props: ILlmConfigProps, id?: string) {
    super(props, id);
  }

  public updateConfig(updates: Partial<ILlmConfigProps>): void {
    Object.assign(this.props, updates);
  }
}
