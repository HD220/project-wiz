import { z } from "zod";
import { randomUUID } from "node:crypto";

export const ConversationSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  userId1: z.string(),
  userId2: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateConversationSchema = ConversationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateConversationSchema = ConversationSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type ConversationData = z.infer<typeof ConversationSchema>;
export type CreateConversationData = z.infer<typeof CreateConversationSchema>;
export type UpdateConversationData = z.infer<typeof UpdateConversationSchema>;
