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
  deactivatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;
