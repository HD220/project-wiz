import type { AuthenticatedUser } from "@/main/features/auth/auth.types";

/**
 * Simple session cache for Electron desktop app
 * Maintains current session state in main process memory
 */
let currentUser: AuthenticatedUser | null = null;

/**
 * Session cache functions for desktop app
 */
export const sessionCache = {
  /**
   * Set current active user (called after login/register)
   */
  set(user: AuthenticatedUser | null): void {
    currentUser = user;
  },

  /**
   * Get current active user (null if not logged in)
   */
  get(): AuthenticatedUser | null {
    return currentUser;
  },

  /**
   * Clear current session (logout)
   */
  clear(): void {
    currentUser = null;
  },

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return currentUser !== null;
  },
};
