import { z } from "zod";

/**
 * Message domain entity
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