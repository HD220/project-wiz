import { z } from "zod";
import { randomUUID } from "node:crypto";
import { MessageTypeEnum } from "../../../../shared/types/message.types";

export const MessageSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  content: z.string().min(1).max(4000),
  conversationId: z.string().uuid(),
  senderId: z.string(),
  receiverId: z.string(),
  type: z.nativeEnum(MessageTypeEnum).default(MessageTypeEnum.TEXT),
  isEdited: z.boolean().default(false),
  isRead: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateMessageSchema = MessageSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type MessageData = z.infer<typeof MessageSchema>;
export type CreateMessageData = z.infer<typeof CreateMessageSchema>;
export type UpdateMessageData = z.infer<typeof UpdateMessageSchema>;
