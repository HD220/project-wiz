import { z } from "zod";

import type {
  SelectLlmProvider,
  InsertLlmProvider,
  ProviderType,
} from "@/main/agents/llm-providers/llm-providers.schema";

// Input type for creating a provider (without generated fields)
export type CreateProviderInput = Omit<
  InsertLlmProvider,
  "id" | "createdAt" | "updatedAt"
>;

// Validation schema for creating a provider
export const createProviderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().nullable(),
  defaultModel: z
    .string()
    .min(1, "Default model is required")
    .default("gpt-3.5-turbo"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Export types for reuse
export type { SelectLlmProvider, InsertLlmProvider, ProviderType };
