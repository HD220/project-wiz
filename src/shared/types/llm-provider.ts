import { z } from "zod";

/**
 * LLM Provider entity schema for public API
 * Clean domain type without technical fields (no encrypted apiKey)
 */
export const LlmProviderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  baseUrl: z.string().nullable(),
  defaultModel: z.string(),
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LlmProvider = z.infer<typeof LlmProviderSchema>;