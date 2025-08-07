import type { LlmProvider } from "@/shared/types";

import type {
  ProviderFormData,
  CreateProviderInput,
  SelectLlmProvider,
} from "./provider-constants";
import type { ProviderFiltersInput } from "./provider.schema";

/**
 * Provider-related types for renderer features
 */

// Re-export shared types for convenience
export type { LlmProvider };

// Schema-derived types
export type { ProviderFiltersInput };

// Re-export types from provider-constants
export type { ProviderFormData, CreateProviderInput, SelectLlmProvider };

/**
 * Provider type enum
 */
export type ProviderType =
  | "openai"
  | "deepseek"
  | "anthropic"
  | "google"
  | "custom";

/**
 * Provider status type
 */
export type ProviderStatus = "active" | "inactive" | "error";

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
  label: string;
  defaultModel: string;
  requiresBaseUrl: boolean;
}

/**
 * Provider list item - minimal provider data for list displays
 */
export interface ProviderListItem {
  id: string;
  name: string;
  type: ProviderType;
  defaultModel: string;
  isDefault: boolean;
  status: ProviderStatus;
  createdAt: Date;
}

/**
 * Provider update input - partial provider data for updates
 */
export interface UpdateProviderInput {
  id: string;
  name?: string;
  type?: ProviderType;
  apiKey?: string;
  baseUrl?: string | null;
  defaultModel?: string;
  isDefault?: boolean;
}
