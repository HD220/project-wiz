import type { AgentStatus } from "@/renderer/features/agent/agent.types";
import type { ProviderType } from "@/renderer/features/agent/provider.types";

/**
 * Search validation utilities following INLINE-FIRST principles
 * Simple, focused functions for common search validations
 */

/**
 * Validates and sanitizes search input
 * @param value Raw search input
 * @returns Sanitized search value or undefined if invalid/empty
 */
export function validateSearchInput(value: string): string | undefined {
  // Basic validation: trim and limit length
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > 100) return trimmed.slice(0, 100);
  return trimmed;
}

/**
 * Type-safe status filter validation
 * @param value Filter value from select
 * @returns Valid AgentStatus or undefined for "all"
 */
export function validateStatusFilter(value: string): AgentStatus | undefined {
  if (value === "all" || !value) return undefined;

  const validStatuses: AgentStatus[] = ["active", "inactive", "busy"];
  return validStatuses.includes(value as AgentStatus)
    ? (value as AgentStatus)
    : undefined;
}

/**
 * Type-safe provider type filter validation
 * @param value Filter value from select
 * @returns Valid provider type or undefined for "all"
 */
export function validateProviderTypeFilter(
  value: string,
): ProviderType | undefined {
  if (value === "all" || !value) return undefined;

  const validTypes: ProviderType[] = [
    "openai",
    "anthropic",
    "google",
    "deepseek",
    "custom",
  ];
  return validTypes.includes(value as ProviderType)
    ? (value as ProviderType)
    : undefined;
}
