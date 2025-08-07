import { z } from "zod";

/**
 * Agent domain entity
 */
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.literal("agent"),
  deactivatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  ownerId: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  providerId: z.string(),
  modelConfig: z.any(),
  status: z.enum(["active", "inactive", "busy"]),
});

export type Agent = z.infer<typeof AgentSchema>;
