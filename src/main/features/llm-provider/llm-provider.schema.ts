import { z } from "zod";

// Schema para criar um LLM provider
export const CreateLlmProviderSchema = z.object({
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

// Schema para atualizar um LLM provider
export const UpdateLlmProviderSchema = z.object({
  name: z.string().min(1, "Provider name is required").optional(),
  type: z
    .enum(["openai", "deepseek", "anthropic", "google", "custom"])
    .optional(),
  apiKey: z.string().min(1, "API key is required").optional(),
  baseUrl: z.string().url("Invalid URL").optional().nullable(),
  defaultModel: z.string().min(1, "Default model is required").optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Schema para testar API key
export const TestApiKeySchema = z.object({
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional(),
});

// Schema para definir provider como padrão
export const SetDefaultProviderSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Schema para buscar providers por usuário
export const FindProvidersByUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Schema para buscar provider por ID
export const FindProviderByIdSchema = z.object({
  id: z.string().min(1, "Provider ID is required"),
});

// Types derivados dos schemas
export type CreateLlmProviderInput = z.infer<typeof CreateLlmProviderSchema>;
export type UpdateLlmProviderInput = z.infer<typeof UpdateLlmProviderSchema>;
export type TestApiKeyInput = z.infer<typeof TestApiKeySchema>;
export type SetDefaultProviderInput = z.infer<typeof SetDefaultProviderSchema>;
export type FindProvidersByUserInput = z.infer<
  typeof FindProvidersByUserSchema
>;
export type FindProviderByIdInput = z.infer<typeof FindProviderByIdSchema>;
