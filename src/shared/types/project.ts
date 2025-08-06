import { z } from "zod";

/**
 * Project entity schema for public API
 * Clean domain type without technical fields
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
  status: z.enum(["active", "archived"]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Project = z.infer<typeof ProjectSchema>;

/**
 * Database select type with all fields including technical ones
 */
export const SelectProjectSchema = ProjectSchema.extend({
  // Add technical fields that might be in database selects
  isActive: z.boolean().default(true),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
});

export type SelectProject = z.infer<typeof SelectProjectSchema>;

/**
 * Insert type for creating new projects
 */
export const InsertProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertProject = z.infer<typeof InsertProjectSchema>;