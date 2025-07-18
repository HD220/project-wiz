import { z } from "zod";

// Project schemas
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Project name contains invalid characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  gitUrl: z.string().url("Invalid Git URL").optional(),
  iconEmoji: z.string().max(10, "Icon emoji too long").optional(),
});

export const UpdateProjectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Project name contains invalid characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  iconEmoji: z.string().max(10, "Icon emoji too long").optional().nullable(),
  settings: z.record(z.any()).optional(),
});

// Channel schemas
export const CreateChannelSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(50, "Channel name cannot exceed 50 characters")
    .regex(
      /^[a-z0-9\-_]+$/,
      "Channel name can only contain lowercase letters, numbers, dash and underscore",
    ),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional(),
  type: z.literal("text").default("text"),
  position: z.number().int().min(0).optional(),
});

export const UpdateChannelSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 characters")
    .max(50, "Channel name cannot exceed 50 characters")
    .regex(
      /^[a-z0-9\-_]+$/,
      "Channel name can only contain lowercase letters, numbers, dash and underscore",
    )
    .optional(),
  description: z
    .string()
    .max(200, "Description cannot exceed 200 characters")
    .optional()
    .nullable(),
  position: z.number().int().min(0).optional(),
});

// Types inferred from schemas
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type CreateChannelInput = z.infer<typeof CreateChannelSchema>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelSchema>;

// Response types
export interface Project {
  id: string;
  name: string;
  description?: string;
  gitUrl?: string;
  localPath?: string;
  iconUrl?: string;
  iconEmoji?: string;
  status: "active" | "archived" | "deleted";
  settings: Record<string, any>;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Channel {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: "text";
  position: number;
  isPrivate: boolean;
  permissions?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
