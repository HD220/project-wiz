import { z } from "zod";

/**
 * Channel entity schema for public API
 * Clean domain type without technical fields
 */
export const ChannelSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;