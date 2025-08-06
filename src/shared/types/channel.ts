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

// Archive Channel Schemas
export const ArchiveChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  archivedBy: z.string().min(1, "Archived by user ID is required"),
});

export const ArchiveChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Get Channel Schemas (simple string ID)
export const GetChannelInputSchema = z.string().min(1, "Channel ID is required");

export const GetChannelOutputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).nullable();

// Find Channel By ID Schemas (for complex queries with options)
export const FindChannelByIdInputSchema = z.object({
  id: z.string().min(1, "Channel ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

export const FindChannelByIdOutputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).nullable();

// Update Channel Schemas
export const UpdateChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  name: z.string().min(1, "Channel name is required").optional(),
  description: z.string().optional(),
});

export const UpdateChannelOutputSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Delete Channel Schemas
export const DeleteChannelInputSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required")
});

export const DeleteChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Get Project Channels Schemas
export const GetProjectChannelsInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  includeInactive: z.boolean().optional().default(false),
  includeArchived: z.boolean().optional().default(false),
});

export const GetProjectChannelsOutputSchema = z.array(z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isArchived: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    authorId: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }).optional(),
}));

// Unarchive Channel Schemas
export const UnarchiveChannelInputSchema = z.string().min(1, "Channel ID is required");

export const UnarchiveChannelOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Export types
export type ArchiveChannelInput = z.infer<typeof ArchiveChannelInputSchema>;
export type ArchiveChannelOutput = z.infer<typeof ArchiveChannelOutputSchema>;
export type GetChannelInput = z.infer<typeof GetChannelInputSchema>;
export type GetChannelOutput = z.infer<typeof GetChannelOutputSchema>;
export type FindChannelByIdInput = z.infer<typeof FindChannelByIdInputSchema>;
export type FindChannelByIdOutput = z.infer<typeof FindChannelByIdOutputSchema>;
export type UpdateChannelInput = z.infer<typeof UpdateChannelInputSchema>;
export type UpdateChannelOutput = z.infer<typeof UpdateChannelOutputSchema>;
export type DeleteChannelInput = z.infer<typeof DeleteChannelInputSchema>;
export type DeleteChannelOutput = z.infer<typeof DeleteChannelOutputSchema>;
export type GetProjectChannelsInput = z.infer<typeof GetProjectChannelsInputSchema>;
export type GetProjectChannelsOutput = z.infer<typeof GetProjectChannelsOutputSchema>;
export type UnarchiveChannelInput = z.infer<typeof UnarchiveChannelInputSchema>;
export type UnarchiveChannelOutput = z.infer<typeof UnarchiveChannelOutputSchema>;