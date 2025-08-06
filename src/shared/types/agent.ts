import { z } from "zod";

/**
 * Agent Domain Entity Schema
 * Complete agent representation (merge of users + agents tables)
 */
export const AgentSchema = z.object({
  // Identity fields (from users table - authoritative)
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.literal("agent"),
  
  // State management (from users table - authoritative) 
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  
  // Timestamps (from users table - authoritative)
  createdAt: z.date(),
  updatedAt: z.date(),
  
  // Agent-specific fields (from agents table)
  ownerId: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  providerId: z.string(),
  modelConfig: z.any(), // JSON object parsed from database
  status: z.enum(["active", "inactive", "busy"]),
});

// Export domain entity type
export type Agent = z.infer<typeof AgentSchema>;

// Agent status type alias for easier usage
export type AgentStatus = Agent['status'];