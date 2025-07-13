import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ChannelMessageTypeEnum } from "../../../../shared/types/channel-message.types";

export const ChannelMessageSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  content: z.string().min(1).max(4000),
  channelId: z.string().uuid(),
  authorId: z.string(),
  authorName: z.string().min(1).max(100),
  type: z.nativeEnum(ChannelMessageTypeEnum).default(ChannelMessageTypeEnum.TEXT),
  isEdited: z.boolean().default(false),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateChannelMessageSchema = ChannelMessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateChannelMessageSchema = ChannelMessageSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type ChannelMessageData = z.infer<typeof ChannelMessageSchema>;
export type CreateChannelMessageData = z.infer<typeof CreateChannelMessageSchema>;
export type UpdateChannelMessageData = z.infer<typeof UpdateChannelMessageSchema>;
