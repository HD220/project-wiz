import { z } from "zod";

/**
 * Consolidated Agent Value Objects
 * Replacing multiple classes with simple types + Zod validation
 */

// Validation schemas
export const AgentNameSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .trim();

export const AgentRoleSchema = z
  .string()
  .min(2, "Role deve ter pelo menos 2 caracteres")
  .max(100, "Role deve ter no máximo 100 caracteres")
  .trim();

export const AgentGoalSchema = z
  .string()
  .min(10, "Goal deve ter pelo menos 10 caracteres")
  .max(500, "Goal deve ter no máximo 500 caracteres")
  .trim();

export const AgentBackstorySchema = z
  .string()
  .min(10, "Backstory deve ter pelo menos 10 caracteres")
  .max(1000, "Backstory deve ter no máximo 1000 caracteres")
  .trim();

export const AgentStatusSchema = z.enum(["active", "inactive", "busy"]);

export const TaskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const TaskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "cancelled",
  "failed",
]);

export const TemperatureSchema = z
  .number()
  .min(0, "Temperature deve ser no mínimo 0")
  .max(2, "Temperature deve ser no máximo 2");

export const MaxTokensSchema = z
  .number()
  .min(1, "Max tokens deve ser no mínimo 1")
  .max(4000, "Max tokens deve ser no máximo 4000");

// Simple types (no classes needed)
export type AgentName = z.infer<typeof AgentNameSchema>;
export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type AgentGoal = z.infer<typeof AgentGoalSchema>;
export type AgentBackstory = z.infer<typeof AgentBackstorySchema>;
export type AgentStatus = z.infer<typeof AgentStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type Temperature = z.infer<typeof TemperatureSchema>;
export type MaxTokens = z.infer<typeof MaxTokensSchema>;

// Utility functions for validation
export const AgentValidation = {
  validateName: (name: string): AgentName => AgentNameSchema.parse(name),
  validateRole: (role: string): AgentRole => AgentRoleSchema.parse(role),
  validateGoal: (goal: string): AgentGoal => AgentGoalSchema.parse(goal),
  validateBackstory: (backstory: string): AgentBackstory =>
    AgentBackstorySchema.parse(backstory),
  validateStatus: (status: string): AgentStatus =>
    AgentStatusSchema.parse(status),
  validateTemperature: (temp: number): Temperature =>
    TemperatureSchema.parse(temp),
  validateMaxTokens: (tokens: number): MaxTokens =>
    MaxTokensSchema.parse(tokens),
};

// Aggregate schema for complete agent data
export const AgentDataSchema = z.object({
  name: AgentNameSchema,
  role: AgentRoleSchema,
  goal: AgentGoalSchema,
  backstory: AgentBackstorySchema,
  status: AgentStatusSchema.default("inactive"),
  temperature: TemperatureSchema.default(0.7),
  maxTokens: MaxTokensSchema.default(1000),
  llmProviderId: z.string().uuid(),
});

export type AgentData = z.infer<typeof AgentDataSchema>;
