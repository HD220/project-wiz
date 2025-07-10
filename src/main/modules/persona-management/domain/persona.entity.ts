import { BaseEntity } from "@/main/kernel/domain/base.entity";

export interface IPersonaProps {
  name: string;
  description: string;
  llmConfig: { model: string; temperature: number };
  tools: string[];
}

export class Persona extends BaseEntity<IPersonaProps> {
  constructor(props: IPersonaProps, id?: string) {
    super(props, id);
  }

  public updateDetails(name: string, description: string): void {
    this.props.name = name;
    this.props.description = description;
  }

  public updateLlmConfig(model: string, temperature: number): void {
    this.props.llmConfig = { model, temperature };
  }

  public updateTools(tools: string[]): void {
    this.props.tools = tools;
  }
}
