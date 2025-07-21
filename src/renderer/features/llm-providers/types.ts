import { z } from "zod";

// Provider types that mirror backend types but specific for UI
export interface LLMProvider {
  id: string;
  name: string;
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string; // Will be masked in UI (e.g., "sk-...1234")
  baseUrl?: string;
  defaultModel: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form input types
export interface CreateProviderInput {
  name: string;
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface UpdateProviderInput {
  name?: string;
  type?: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface TestApiKeyInput {
  type: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  apiKey: string;
  baseUrl?: string;
}

// Provider type options for UI
export const PROVIDER_TYPES = {
  openai: {
    label: "OpenAI",
    icon: "🔴",
    defaultModel: "gpt-4o",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
    requiresBaseUrl: false,
  },
  deepseek: {
    label: "DeepSeek",
    icon: "🔷", 
    defaultModel: "deepseek-coder",
    models: ["deepseek-coder", "deepseek-chat"],
    requiresBaseUrl: false,
  },
  anthropic: {
    label: "Anthropic",
    icon: "⚡",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: ["claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    requiresBaseUrl: false,
  },
  google: {
    label: "Google",
    icon: "🔵",
    defaultModel: "gemini-pro",
    models: ["gemini-pro", "gemini-pro-vision"],
    requiresBaseUrl: false,
  },
  custom: {
    label: "Custom",
    icon: "⚙️",
    defaultModel: "custom-model",
    models: [],
    requiresBaseUrl: true,
  },
} as const;

export type ProviderType = keyof typeof PROVIDER_TYPES;

// Form validation schemas
export const providerFormSchema = z.object({
  name: z
    .string()
    .min(1, "Provider name is required")
    .max(50, "Name must be less than 50 characters"),
  
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"], {
    required_error: "Please select a provider type",
  }),
  
  apiKey: z
    .string()
    .min(1, "API key is required")
    .min(10, "API key must be at least 10 characters"),
  
  baseUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  
  defaultModel: z
    .string()
    .min(1, "Default model is required"),
  
  isDefault: z.boolean().default(false),
  
  isActive: z.boolean().default(true),
});

export type ProviderFormData = z.infer<typeof providerFormSchema>;

// Test API key schema
export const testApiKeySchema = z.object({
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string().min(1, "API key is required"),
  baseUrl: z.string().url().optional().or(z.literal("")),
});

export type TestApiKeyData = z.infer<typeof testApiKeySchema>;

// UI utility functions
export const maskApiKey = (apiKey: string): string => {
  if (apiKey.length <= 8) {
    return "●".repeat(apiKey.length);
  }
  return `${apiKey.slice(0, 4)}${"●".repeat(Math.max(0, apiKey.length - 8))}${apiKey.slice(-4)}`;
};

export const getProviderIcon = (type: ProviderType): string => {
  return PROVIDER_TYPES[type]?.icon || "⚙️";
};

export const getProviderLabel = (type: ProviderType): string => {
  return PROVIDER_TYPES[type]?.label || "Unknown";
};

export const getDefaultModel = (type: ProviderType): string => {
  return PROVIDER_TYPES[type]?.defaultModel || "";
};

export const getAvailableModels = (type: ProviderType): string[] => {
  return PROVIDER_TYPES[type]?.models || [];
};

export const requiresBaseUrl = (type: ProviderType): boolean => {
  return PROVIDER_TYPES[type]?.requiresBaseUrl || false;
};