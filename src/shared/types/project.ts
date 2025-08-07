import { z } from "zod";

/**
 * Project domain entity
 */
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  gitUrl: z.string().nullable(),
  branch: z.string().nullable(),
  localPath: z.string(),
  ownerId: z.string(),
  deactivatedAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;
