import { extractUserIdFromToken } from "../user/authentication/auth.service";

/**
 * Extract user ID from IPC data
 * This function expects the token to be passed in the data payload
 */
export function extractUserId(data: any): string | null {
  // Try to extract from token first
  if (data.token) {
    const userId = extractUserIdFromToken(data.token);
    if (userId) {
      return userId;
    }
  }

  // Fallback to userId if provided directly
  if (data.userId) {
    return data.userId;
  }

  // No valid authentication found
  return null;
}

/**
 * Extract user ID from IPC data with error handling
 * Throws error if user is not authenticated
 */
export function requireUserId(data: any): string {
  const userId = extractUserId(data);

  if (!userId) {
    throw new Error("Authentication required");
  }

  return userId;
}
