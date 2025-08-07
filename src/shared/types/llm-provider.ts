import { z } from "zod";

/**
 * LLM Provider domain entity
 */
export const LlmProviderSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string(),
  baseUrl: z.string().nullable(),
  defaultModel: z.string(),
  isDefault: z.boolean(),
  deactivatedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LlmProvider = z.infer<typeof LlmProviderSchema>;