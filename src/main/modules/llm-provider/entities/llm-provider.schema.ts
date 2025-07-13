import { z } from "zod";
import { randomUUID } from "node:crypto";

export const LlmProviderSchema = z.object({
  id: z
    .string()
    .uuid()
    .default(() => randomUUID()),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long"),
  provider: z.string(),
  model: z.string(),
  apiKey: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export const CreateLlmProviderSchema = LlmProviderSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLlmProviderSchema = LlmProviderSchema.partial().extend({
  id: z.string().uuid(),
  updatedAt: z.date().default(() => new Date()),
});

export type LlmProviderData = z.infer<typeof LlmProviderSchema>;
export type CreateLlmProviderData = z.infer<typeof CreateLlmProviderSchema>;
export type UpdateLlmProviderData = z.infer<typeof UpdateLlmProviderSchema>;
