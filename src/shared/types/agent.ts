import { z } from "zod";

/**
 * Agent entity schema for public API
 * Clean domain type without technical fields
 */
export const AgentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  avatar: z.string().nullable(),
  status: z.enum(["active", "inactive", "busy"]),
  modelConfig: z.record(z.unknown()),
  providerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Agent = z.infer<typeof AgentSchema>;

// Agent status type alias for easier usage
export type AgentStatus = Agent['status'];

// Form data types for renderer
export const ModelConfigSchema = z.object({
  model: z.string(),
  temperature: z.number(),
  maxTokens: z.number(),
  topP: z.number().optional(),
});

export type ModelConfig = z.infer<typeof ModelConfigSchema>;

export const AgentFormDataSchema = z.object({
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  providerId: z.string(),
  modelConfig: ModelConfigSchema,
  status: AgentSchema.shape.status,
  avatar: z.string().optional(),
});

export type AgentFormData = z.infer<typeof AgentFormDataSchema>;