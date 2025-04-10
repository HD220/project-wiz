import { LLMAdvancedParameters } from '../value-objects/LLMAdvancedParameters';

export class PresetLLMConfig {
  private readonly id: string;
  private name: string;
  private description: string;
  private parameters: LLMAdvancedParameters;

  constructor(
    id: string,
    name: string,
    description: string,
    parameters: LLMAdvancedParameters
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public getParameters(): LLMAdvancedParameters {
    return this.parameters;
  }

  public setParameters(parameters: LLMAdvancedParameters): void {
    this.parameters = parameters;
  }
}