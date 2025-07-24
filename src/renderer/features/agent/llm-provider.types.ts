/**
 * LLM Provider types for renderer process
 */

export type ProviderType =
  | "openai"
  | "deepseek"
  | "anthropic"
  | "google"
  | "custom";

export interface LlmProvider {
  id: string;
  userId: string;
  name: string;
  type: ProviderType;
  apiKey: string; // Will be masked in UI
  baseUrl: string | null;
  defaultModel: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestApiKeyResult {
  valid: boolean;
  message: string;
  model?: string;
}
