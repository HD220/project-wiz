import { z } from "zod";

const AgentConfigurationSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  goal: z.string().min(10),
  backstory: z.string().min(10),
  llmProviderId: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  status: z.enum(["active", "inactive", "busy"]).default("inactive"),
});

export type AgentConfigurationData = z.infer<typeof AgentConfigurationSchema>;

export class AgentConfiguration {
  constructor(private readonly data: AgentConfigurationData) {
    this.data = AgentConfigurationSchema.parse(data);
  }

  public getName(): string {
    return this.data.name;
  }

  public getRole(): string {
    return this.data.role;
  }

  public getGoal(): string {
    return this.data.goal;
  }

  public getBackstory(): string {
    return this.data.backstory;
  }

  public getLlmProviderId(): string {
    return this.data.llmProviderId;
  }

  public getTemperature(): number {
    return this.data.temperature;
  }

  public getMaxTokens(): number {
    return this.data.maxTokens;
  }

  public getStatus(): string {
    return this.data.status;
  }

  public isActive(): boolean {
    return this.data.status === "active";
  }

  public isBusy(): boolean {
    return this.data.status === "busy";
  }

  public isInactive(): boolean {
    return this.data.status === "inactive";
  }

  public isConfigured(): boolean {
    return (
      this.data.name.length > 0 &&
      this.data.role.length > 0 &&
      this.data.goal.length > 0 &&
      this.data.backstory.length > 0 &&
      this.data.llmProviderId.length > 0
    );
  }

  public hasValidLLM(): boolean {
    return this.data.llmProviderId.length > 0;
  }

  public generateSystemPrompt(): string {
    const header = `You are ${this.data.name}, a ${this.data.role}.`;
    const goal = `Goal: ${this.data.goal}`;
    const background = `Background: ${this.data.backstory}`;
    const footer = "Please respond according to your role and expertise.";

    return `${header}\n\n${goal}\n\n${background}\n\n${footer}`;
  }

  public toData(): AgentConfigurationData {
    return { ...this.data };
  }

  public equals(other: AgentConfiguration): boolean {
    return (
      this.data.name === other.data.name && this.data.role === other.data.role
    );
  }
}
