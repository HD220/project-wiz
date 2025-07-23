import type { AuthenticatedUser } from "@/main/features/auth/auth.types";

/**
 * Internal session manager for Electron desktop app
 * Maintains current session state in main process memory
 */
class SessionManager {
  private currentUser: AuthenticatedUser | null = null;
  private currentSessionToken: string | null = null;

  /**
   * Set current active session (called after login/register)
   */
  setSession(user: AuthenticatedUser, sessionToken: string): void {
    this.currentUser = user;
    this.currentSessionToken = sessionToken;
  }

  /**
   * Get current active user (null if not logged in)
   */
  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUser;
  }

  /**
   * Get current session token (internal use only)
   */
  getCurrentSessionToken(): string | null {
    return this.currentSessionToken;
  }

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Clear current session (logout)
   */
  clearSession(): void {
    this.currentUser = null;
    this.currentSessionToken = null;
  }

  /**
   * Load session from database on app startup
   */
  async loadSessionFromDatabase(): Promise<boolean> {
    try {
      const { AuthService } = await import("@/main/features/auth/auth.service");
      const activeSession = await AuthService.getActiveSession();

      if (activeSession) {
        this.setSession(activeSession.user, activeSession.sessionToken);
        return true;
      }

      return false;
    } catch (error) {
      console.warn("Failed to load session from database:", error);
      return false;
    }
  }
}

// Singleton instance for the entire app
export const sessionManager = new SessionManager();
