import { z } from "zod";

/**
 * Channel domain entity
 */
export const ChannelSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;