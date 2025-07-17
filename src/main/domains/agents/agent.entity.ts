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

class AgentIdentity {
  constructor(
    private id: string,
    private name: string,
    private role: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return this.role;
  }
}

class AgentPersonality {
  constructor(
    private goal: string,
    private backstory: string,
  ) {}

  getGoal(): string {
    return this.goal;
  }

  getBackstory(): string {
    return this.backstory;
  }
}

class AgentConfiguration {
  constructor(
    private llmProviderId: string,
    private temperature: number,
    private maxTokens: number,
  ) {}

  getLlmProviderId(): string {
    return this.llmProviderId;
  }

  getTemperature(): number {
    return this.temperature;
  }

  getMaxTokens(): number {
    return this.maxTokens;
  }
}

class AgentStatus {
  constructor(private status: string) {}

  getStatus(): string {
    return this.status;
  }

  isActive(): boolean {
    return this.status === "active";
  }

  isBusy(): boolean {
    return this.status === "busy";
  }

  canStartTask(): boolean {
    return this.status === "active";
  }

  activate(): AgentStatus {
    return new AgentStatus("active");
  }

  deactivate(): AgentStatus {
    return new AgentStatus("inactive");
  }

  setBusy(): AgentStatus {
    return new AgentStatus("busy");
  }
}

export class Agent {
  private identity: AgentIdentity;
  private personality: AgentPersonality;
  private configuration: AgentConfiguration;
  private status: AgentStatus;

  constructor(private data: AgentData) {
    this.data = AgentSchema.parse(data);
    this.identity = new AgentIdentity(data.id, data.name, data.role);
    this.personality = new AgentPersonality(data.goal, data.backstory);
    this.configuration = new AgentConfiguration(
      data.llmProviderId,
      data.temperature,
      data.maxTokens,
    );
    this.status = new AgentStatus(data.status);
  }

  // Delegate to composed objects
  getId(): string {
    return this.identity.getId();
  }

  getName(): string {
    return this.identity.getName();
  }

  getRole(): string {
    return this.identity.getRole();
  }

  getGoal(): string {
    return this.personality.getGoal();
  }

  getBackstory(): string {
    return this.personality.getBackstory();
  }

  getStatus(): string {
    return this.status.getStatus();
  }

  getLlmProviderId(): string {
    return this.configuration.getLlmProviderId();
  }

  getTemperature(): number {
    return this.configuration.getTemperature();
  }

  getMaxTokens(): number {
    return this.configuration.getMaxTokens();
  }

  // Lógica de negócio consolidada
  generateSystemPrompt(): string {
    return new AgentPromptGenerator(this.identity, this.personality).generate();
  }

  isValidForExecution(): boolean {
    return (
      this.status.isActive() && this.configuration.getLlmProviderId().length > 0
    );
  }

  canStartTask(): boolean {
    return this.status.canStartTask();
  }

  // Operações de estado
  activate(): Agent {
    return new Agent({
      ...this.data,
      status: "active",
      updatedAt: new Date(),
    });
  }

  deactivate(): Agent {
    return new Agent({
      ...this.data,
      status: "inactive",
      updatedAt: new Date(),
    });
  }

  setBusy(): Agent {
    return new Agent({
      ...this.data,
      status: "busy",
      updatedAt: new Date(),
    });
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
    return this.identity.getId() === other.identity.getId();
  }
}

class AgentPromptGenerator {
  constructor(
    private identity: AgentIdentity,
    private personality: AgentPersonality,
  ) {}

  generate(): string {
    const header = this.generateHeader();
    const goal = this.generateGoal();
    const background = this.generateBackground();
    const footer = this.generateFooter();

    return `${header}

${goal}

${background}

${footer}`;
  }

  private generateHeader(): string {
    return `You are ${this.identity.getName()}, a ${this.identity.getRole()}.`;
  }

  private generateGoal(): string {
    return `Goal: ${this.personality.getGoal()}`;
  }

  private generateBackground(): string {
    return `Background: ${this.personality.getBackstory()}`;
  }

  private generateFooter(): string {
    return "Please respond according to your role and expertise.";
  }
}
