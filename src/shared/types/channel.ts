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
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  isArchived: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Channel = z.infer<typeof ChannelSchema>;

/**
 * Database select type (same as Channel for now)
 */
export type SelectProjectChannel = Channel;

/**
 * Create channel input type
 */
export const CreateProjectChannelInputSchema = ChannelSchema.pick({
  projectId: true,
  name: true,
  description: true,
});

export type CreateProjectChannelInput = z.infer<typeof CreateProjectChannelInputSchema>;

/**
 * Channel with last message
 */
export const ProjectChannelWithLastMessageSchema = ChannelSchema.extend({
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.date(),
    senderId: z.string(),
    senderName: z.string(),
  }).optional(),
});

export type ProjectChannelWithLastMessage = z.infer<typeof ProjectChannelWithLastMessageSchema>;

/**
 * Channel filters
 */
export const ProjectChannelFiltersSchema = z.object({
  projectId: z.string(),
  includeInactive: z.boolean().optional(),
  includeArchived: z.boolean().optional(),
});

export type ProjectChannelFilters = z.infer<typeof ProjectChannelFiltersSchema>;