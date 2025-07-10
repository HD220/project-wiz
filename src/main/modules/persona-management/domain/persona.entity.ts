import { BaseEntity } from "@/shared/common/base.entity";

export interface PersonaProps {
  name: string;
  description: string;
  llmConfig: { model: string; temperature: number };
  tools: string[];
}

export class Persona extends BaseEntity<PersonaProps> {
  constructor(props: PersonaProps, id?: string) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get llmConfig(): { model: string; temperature: number } {
    return this.props.llmConfig;
  }

  get tools(): string[] {
    return this.props.tools;
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
