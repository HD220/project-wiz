import { z } from "zod";

export const PROVIDER_CONFIGS = {
  openai: { label: "OpenAI", defaultModel: "gpt-4o", requiresBaseUrl: false },
  deepseek: {
    label: "DeepSeek",
    defaultModel: "deepseek-coder",
    requiresBaseUrl: false,
  },
  anthropic: {
    label: "Anthropic",
    defaultModel: "claude-3-5-sonnet-20241022",
    requiresBaseUrl: false,
  },
  google: {
    label: "Google",
    defaultModel: "gemini-pro",
    requiresBaseUrl: false,
  },
  custom: {
    label: "Custom",
    defaultModel: "custom-model",
    requiresBaseUrl: true,
  },
} as const;

export const providerFormSchema = z.object({
  name: z.string().min(1, "Provider name is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  defaultModel: z.string().min(1, "Default model is required"),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type ProviderFormData = z.infer<typeof providerFormSchema>;

// LLM Provider types
export interface SelectLlmProvider {
  id: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string | null;
  defaultModelConfig?: string | null;
  status: "active" | "inactive" | "error";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProviderInput {
  name: string;
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string | null;
  defaultModelConfig?: string | null;
}
