import { BaseEntity } from "@/main/kernel/domain/base.entity";
import { z } from "zod";

export const PersonaPropsSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  llmModel: z.string().min(1),
  llmTemperature: z.number().min(0).max(1).default(0.7),
  tools: z.array(z.string()).default([]), // Array of tool names
  role: z.string().min(1), // 'developer', 'tester', 'designer', 'reviewer', 'assistant'
  profile: z.string().optional(),
  backstory: z.string().optional(),
  objective: z.string().optional(),
  systemPrompt: z.string().min(1),
  isBuiltIn: z.boolean().default(false),
  status: z.enum(["idle", "working", "paused", "error"]).default("idle"),
  currentTaskId: z.string().uuid().optional(),
  worktreePath: z.string().optional(),
  maxConcurrentTasks: z.number().int().min(1).default(1),
  capabilities: z.array(z.string()).default([]), // JSON array of capabilities
});

export type PersonaProps = z.infer<typeof PersonaPropsSchema>;

export class Persona extends BaseEntity<PersonaProps> {
  constructor(props: PersonaProps, id?: string) {
    const validatedProps = PersonaPropsSchema.parse(props);
    super(validatedProps, id);
  }

  // Update methods
  updateDetails(name: string, description?: string): void {
    this.props.name = name;
    this.props.description = description;
    this.touch();
  }

  updateLlmConfig(llmModel: string, llmTemperature: number): void {
    this.props.llmModel = llmModel;
    this.props.llmTemperature = llmTemperature;
    this.touch();
  }

  updateTools(tools: string[]): void {
    this.props.tools = tools;
    this.touch();
  }

  updateRole(role: string): void {
    this.props.role = role;
    this.touch();
  }

  updateProfile(profile: string): void {
    this.props.profile = profile;
    this.touch();
  }

  updateBackstory(backstory: string): void {
    this.props.backstory = backstory;
    this.touch();
  }

  updateObjective(objective: string): void {
    this.props.objective = objective;
    this.touch();
  }

  updateSystemPrompt(systemPrompt: string): void {
    this.props.systemPrompt = systemPrompt;
    this.touch();
  }

  updateStatus(status: PersonaProps['status']): void {
    this.props.status = status;
    this.touch();
  }

  assignTask(taskId: string, worktreePath: string): void {
    this.props.currentTaskId = taskId;
    this.props.worktreePath = worktreePath;
    this.props.status = "working";
    this.touch();
  }

  completeTask(): void {
    this.props.currentTaskId = undefined;
    this.props.worktreePath = undefined;
    this.props.status = "idle";
    this.touch();
  }

  updateCapabilities(capabilities: string[]): void {
    this.props.capabilities = capabilities;
    this.touch();
  }

  // Getters
  get name(): string {
    return this.props.name;
  }

  get role(): string {
    return this.props.role;
  }

  get systemPrompt(): string {
    return this.props.systemPrompt;
  }

  get llmModel(): string {
    return this.props.llmModel;
  }

  get llmTemperature(): number {
    return this.props.llmTemperature;
  }

  get capabilities(): string[] {
    return this.props.capabilities;
  }

  get isBuiltIn(): boolean {
    return this.props.isBuiltIn;
  }

  get status(): PersonaProps['status'] {
    return this.props.status;
  }

  get currentTaskId(): string | undefined {
    return this.props.currentTaskId;
  }

  get worktreePath(): string | undefined {
    return this.props.worktreePath;
  }
}