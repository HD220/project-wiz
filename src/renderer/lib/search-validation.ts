/**
 * Generic search validation utilities following INLINE-FIRST principles
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
 * Generic filter validation for select values
 * @param value Filter value from select
 * @param validValues Array of valid values
 * @returns Valid value or undefined for "all"
 */
export function validateSelectFilter<T extends string>(
  value: string,
  validValues: T[],
): T | undefined {
  if (value === "all" || !value) return undefined;
  return validValues.includes(value as T) ? (value as T) : undefined;
}

/**
 * Validates provider type filter values
 * @param value Provider type filter value
 * @returns Valid provider type or undefined for "all"
 */
export function validateProviderTypeFilter(
  value: string,
): "openai" | "deepseek" | "anthropic" | "google" | "custom" | undefined {
  const validProviderTypes: (
    | "openai"
    | "deepseek"
    | "anthropic"
    | "google"
    | "custom"
  )[] = ["openai", "deepseek", "anthropic", "google", "custom"];
  return validateSelectFilter(value, validProviderTypes);
}
