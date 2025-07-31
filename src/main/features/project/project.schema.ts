import { z } from "zod";

// Basic project creation schema - minimal validation
export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").trim(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  gitUrl: z.string().optional(),
  branch: z.string().optional(),
  localPath: z.string().min(1, "Local path is required"),
  status: z.enum(["active", "archived"]).default("active").optional(),
});

// Basic project update schema - minimal validation
export const UpdateProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Project name is required").trim().optional(),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
  gitUrl: z.string().optional(),
  branch: z.string().optional(),
  localPath: z.string().min(1, "Local path is required").optional(),
  status: z.enum(["active", "archived"]).optional(),
});

// Type exports
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
