import { z } from "zod";

/**
 * Direct Message domain entity
 */
export const DirectMessageSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  archivedAt: z.date().nullable(),
  deactivatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DirectMessage = z.infer<typeof DirectMessageSchema>;

/**
 * Direct Message Participant domain entity
 */
export const DirectMessageParticipantSchema = z.object({
  id: z.string(),
  directMessageId: z.string(),
  participantId: z.string(),
  deactivatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DirectMessageParticipant = z.infer<
  typeof DirectMessageParticipantSchema
>;

// Backward compatibility exports
export const DMConversationSchema = DirectMessageSchema;
export type DMConversation = DirectMessage;
export const DMParticipantSchema = DirectMessageParticipantSchema;
export type DMParticipant = DirectMessageParticipant;
