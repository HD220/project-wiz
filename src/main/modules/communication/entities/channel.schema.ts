import { z } from "zod";
import { randomUUID } from "node:crypto";
import { ChannelTypeEnum } from "../../../../shared/types/channel.types";

export const ChannelSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long")
    .regex(/^[a-zA-Z0-9-_]+$/, "Name can only contain letters, numbers, hyphens, and underscores")
    .refine(name => !/^-|_/.test(name) && !/[-_]$/.test(name), "Name cannot start or end with a hyphen or underscore"),
  projectId: z.string().uuid(),
  type: z.nativeEnum(ChannelTypeEnum).default(ChannelTypeEnum.CUSTOM),
  createdBy: z.string(),
  isPrivate: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  description: z.string().max(500).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateChannelSchema = ChannelSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateChannelSchema = ChannelSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type ChannelData = z.infer<typeof ChannelSchema>;
export type CreateChannelData = z.infer<typeof CreateChannelSchema>;
export type UpdateChannelData = z.infer<typeof UpdateChannelSchema>;
