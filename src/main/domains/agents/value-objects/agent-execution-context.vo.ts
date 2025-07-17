import { z } from "zod";

const AgentExecutionContextSchema = z.object({
  agentId: z.string().uuid(),
  promptTemplate: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(100).max(4000),
  llmProviderId: z.string().min(1),
});

export type AgentExecutionContextData = z.infer<
  typeof AgentExecutionContextSchema
>;

export class AgentExecutionContext {
  constructor(private readonly data: AgentExecutionContextData) {
    this.data = AgentExecutionContextSchema.parse(data);
  }

  public getAgentId(): string {
    return this.data.agentId;
  }

  public getPromptTemplate(): string {
    return this.data.promptTemplate;
  }

  public getTemperature(): number {
    return this.data.temperature;
  }

  public getMaxTokens(): number {
    return this.data.maxTokens;
  }

  public getLlmProviderId(): string {
    return this.data.llmProviderId;
  }

  public isValidForExecution(): boolean {
    return (
      this.data.promptTemplate.length > 0 && this.data.llmProviderId.length > 0
    );
  }

  public toData(): AgentExecutionContextData {
    return { ...this.data };
  }

  public equals(other: AgentExecutionContext): boolean {
    return this.data.agentId === other.data.agentId;
  }
}
