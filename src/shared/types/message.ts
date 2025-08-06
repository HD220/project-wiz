import { z } from "zod";

/**
 * Message entity schema for public API
 * Clean domain type without technical fields
 */
export const MessageSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["dm", "channel"]),
  sourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Message source type enum
 */
export type MessageSourceType = "dm" | "channel";

/**
 * Database select type with all fields
 */
export const SelectMessageSchema = MessageSchema.extend({
  // Add technical fields for database selects
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
});

export type SelectMessage = z.infer<typeof SelectMessageSchema>;

/**
 * Send message input type
 */
export const SendMessageInputSchema = z.object({
  sourceType: z.enum(["dm", "channel"]),
  sourceId: z.string(),
  content: z.string(),
  authorId: z.string(),
});

export type SendMessageInput = z.infer<typeof SendMessageInputSchema>;