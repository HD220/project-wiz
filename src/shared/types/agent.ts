import { z } from "zod";

/**
 * Agent Domain Entity Schema
 * Represents an AI agent in the system
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
  modelConfig: z.string(), // JSON string stored in database
  providerId: z.string(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export domain entity type
export type Agent = z.infer<typeof AgentSchema>;

// Agent status type alias for easier usage
export type AgentStatus = Agent['status'];