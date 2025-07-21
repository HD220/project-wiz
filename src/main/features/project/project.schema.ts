import { z } from "zod";

/**
 * Schema for project creation validation
 */
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
  gitUrl: z.string().url("Git URL must be a valid URL").optional(),
  branch: z
    .string()
    .min(1, "Branch name must not be empty")
    .max(100, "Branch name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9._/-]+$/, "Branch name contains invalid characters")
    .optional(),
  localPath: z
    .string()
    .min(1, "Local path is required")
    .max(500, "Local path must not exceed 500 characters"),
  status: z
    .enum(["active", "archived"], {
      errorMap: () => ({
        message: "Status must be either 'active' or 'archived'",
      }),
    })
    .default("active")
    .optional(),
});

/**
 * Schema for project update validation
 */
export const UpdateProjectSchema = z.object({
  id: z.string().uuid("Project ID must be a valid UUID"),
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must not exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .trim()
    .optional(),
  avatarUrl: z.string().url("Avatar URL must be a valid URL").optional(),
  gitUrl: z.string().url("Git URL must be a valid URL").optional(),
  branch: z
    .string()
    .min(1, "Branch name must not be empty")
    .max(100, "Branch name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9._/-]+$/, "Branch name contains invalid characters")
    .optional(),
  localPath: z
    .string()
    .min(1, "Local path is required")
    .max(500, "Local path must not exceed 500 characters")
    .optional(),
  status: z
    .enum(["active", "archived"], {
      errorMap: () => ({
        message: "Status must be either 'active' or 'archived'",
      }),
    })
    .optional(),
});

/**
 * Schema for project ID validation
 */
export const ProjectIdSchema = z
  .string()
  .uuid("Project ID must be a valid UUID");

/**
 * Schema for project name validation (standalone)
 */
export const ProjectNameSchema = z
  .string()
  .min(1, "Project name is required")
  .max(100, "Project name must not exceed 100 characters")
  .trim();

/**
 * Schema for project status validation (standalone)
 */
export const ProjectStatusSchema = z.enum(["active", "archived"], {
  errorMap: () => ({ message: "Status must be either 'active' or 'archived'" }),
});

/**
 * Schema for project filters validation
 */
export const ProjectFiltersSchema = z
  .object({
    status: ProjectStatusSchema.optional(),
    search: z
      .string()
      .max(200, "Search term must not exceed 200 characters")
      .trim()
      .optional(),
    hasGitUrl: z.boolean().optional(),
    hasLocalPath: z.boolean().optional(),
  })
  .partial();

/**
 * Schema for project archive operation
 */
export const ArchiveProjectSchema = z.object({
  id: ProjectIdSchema,
});

// Type exports for use in other files
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectFiltersInput = z.infer<typeof ProjectFiltersSchema>;
export type ArchiveProjectInput = z.infer<typeof ArchiveProjectSchema>;
