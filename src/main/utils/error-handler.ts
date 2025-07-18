import { APIError } from "../../shared/types/common";

/**
 * Handle errors for IPC communication
 * Converts unknown errors to APIError format
 */
export function handleError(error: unknown): APIError {
  // If it's already an APIError, return as is
  if (error instanceof APIError) {
    return error;
  }

  // If it's a regular Error, convert to APIError
  if (error instanceof Error) {
    return new APIError(error.message, "INTERNAL_ERROR", 500);
  }

  // For unknown error types, create generic error
  return new APIError("An unknown error occurred", "UNKNOWN_ERROR", 500);
}

/**
 * Extract user ID from IPC event (if authenticated)
 */
export function extractUserId(
  _event: Electron.IpcMainInvokeEvent,
): string | null {
  // In a real implementation, you would extract this from the session or token
  // For now, we'll implement a simple approach

  // This would typically be stored in the renderer process and passed with requests
  // or extracted from a session/token system

  // TODO: Implement proper authentication extraction
  return null;
}
