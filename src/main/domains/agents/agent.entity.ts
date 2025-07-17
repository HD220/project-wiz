import { z } from "zod";

// Schemas consolidados
const AgentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  goal: z.string().min(10),
  backstory: z.string().min(10),
  llmProviderId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
  status: z.enum(["active", "inactive", "busy"]).default("inactive"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type AgentData = z.infer<typeof AgentSchema>;

export class Agent {
  constructor(private data: AgentData) {
    this.data = AgentSchema.parse(data);
  }

  // Getters essenciais
  getId(): string {
    return this.data.id;
  }
  getName(): string {
    return this.data.name;
  }
  getRole(): string {
    return this.data.role;
  }
  getGoal(): string {
    return this.data.goal;
  }
  getBackstory(): string {
    return this.data.backstory;
  }
  getStatus(): string {
    return this.data.status;
  }
  getLlmProviderId(): string {
    return this.data.llmProviderId;
  }
  getTemperature(): number {
    return this.data.temperature;
  }
  getMaxTokens(): number {
    return this.data.maxTokens;
  }

  // Lógica de negócio consolidada
  generateSystemPrompt(): string {
    return `You are ${this.data.name}, a ${this.data.role}.

Goal: ${this.data.goal}

Background: ${this.data.backstory}

Please respond according to your role and expertise.`;
  }

  isValidForExecution(): boolean {
    return this.data.status === "active" && this.data.llmProviderId.length > 0;
  }

  canStartTask(): boolean {
    return this.data.status === "active";
  }

  // Operações de estado
  activate(): Agent {
    return new Agent({ ...this.data, status: "active", updatedAt: new Date() });
  }

  deactivate(): Agent {
    return new Agent({
      ...this.data,
      status: "inactive",
      updatedAt: new Date(),
    });
  }

  setBusy(): Agent {
    return new Agent({ ...this.data, status: "busy", updatedAt: new Date() });
  }

  // Atualização de dados
  updateConfig(
    updates: Partial<
      Pick<
        AgentData,
        "name" | "role" | "goal" | "backstory" | "temperature" | "maxTokens"
      >
    >,
  ): Agent {
    return new Agent({
      ...this.data,
      ...updates,
      updatedAt: new Date(),
    });
  }

  // Conversão para dados persistidos
  toData(): AgentData {
    return { ...this.data };
  }

  // Comparação
  equals(other: Agent): boolean {
    return this.data.id === other.data.id;
  }
}
