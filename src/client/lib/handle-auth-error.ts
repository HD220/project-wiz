/**
 * Helper to extract a user-friendly error message from an error object.
 * Used in authentication flows to avoid code repetition.
 */
export function handleAuthError(error: unknown, defaultMessage: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultMessage;
}