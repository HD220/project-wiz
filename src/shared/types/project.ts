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
  isActive: z.boolean(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;