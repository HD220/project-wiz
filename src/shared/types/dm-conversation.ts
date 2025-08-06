import { z } from "zod";

/**
 * DM Conversation Domain Entity Schema
 * Represents a direct message conversation between users
 */
export const DMConversationSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
  archivedBy: z.string().nullable(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * DM Participant Domain Entity Schema
 * Represents a user's participation in a DM conversation
 */
export const DMParticipantSchema = z.object({
  id: z.string(),
  dmConversationId: z.string(),
  participantId: z.string(),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export domain entity types
export type DMConversation = z.infer<typeof DMConversationSchema>;
export type DMParticipant = z.infer<typeof DMParticipantSchema>;