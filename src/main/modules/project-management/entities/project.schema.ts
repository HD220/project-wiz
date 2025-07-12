import { z } from "zod";
import { randomUUID } from "node:crypto";

export const ProjectSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  name: z
    .string()
    .min(1, "Project name cannot be empty")
    .max(100, "Project name too long")
    .transform((val) => val.trim()),
  description: z.string().optional(),
  gitUrl: z.string().url("Invalid Git URL format").optional(),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
  avatar: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectSchema = ProjectSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type ProjectData = z.infer<typeof ProjectSchema>;
export type CreateProjectData = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectData = z.infer<typeof UpdateProjectSchema>;