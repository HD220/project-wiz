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

/**
 * Database select type (same as domain type for now)
 */
export type SelectDMConversation = DMConversation;

/**
 * DM Conversation with participants
 */
export const DMConversationWithParticipantsSchema = DMConversationSchema.extend({
  participants: z.array(DMParticipantSchema),
});

export type DMConversationWithParticipants = z.infer<typeof DMConversationWithParticipantsSchema>;

/**
 * DM Conversation with last message
 */
export const DMConversationWithLastMessageSchema = DMConversationSchema.extend({
  lastMessage: z.object({
    id: z.string(),
    content: z.string(),
    createdAt: z.date(),
    authorId: z.string(),
    senderName: z.string(),
  }).optional(),
});

export type DMConversationWithLastMessage = z.infer<typeof DMConversationWithLastMessageSchema>;

/**
 * Create DM conversation input
 */
export const CreateDMConversationInputSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  participantIds: z.array(z.string()).min(2, "At least 2 participants required"),
});

export type CreateDMConversationInput = z.infer<typeof CreateDMConversationInputSchema>;