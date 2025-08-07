import { eq, and, gt, desc, isNull } from "drizzle-orm";

import { userSessionsTable } from "@/main/schemas/user-sessions.schema";
import { usersTable } from "@/main/schemas/user.schema";

import { createDatabaseConnection } from "@/shared/config/database";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import type { User } from "@/shared/types/user";

const logger = getLogger("session-registry");
const { getDatabase } = createDatabaseConnection(true);

export interface SessionData {
  user: User;
  token: string;
  expiresAt: Date;
}

export interface LoginResult {
  user: User;
  sessionToken: string;
}

/**
 * Centralized Session Registry for Project Wiz
 * Manages user authentication state with reactive updates via event-bus
 */
export class SessionRegistry {
  private currentSession: SessionData | null = null;

  /**
   * Get current authenticated user (null if not logged in)
   */
  getCurrentUser(): User | null {
    if (!this.currentSession) {
      return null;
    }

    // Check if session is expired
    if (this.currentSession.expiresAt <= new Date()) {
      logger.warn("Session expired, clearing cache");
      this.clearSession();
      return null;
    }

    return this.currentSession.user;
  }

  /**
   * Get current session token
   */
  getCurrentToken(): string | null {
    return this.currentSession?.token || null;
  }

  /**
   * Check if user is currently logged in with valid session
   */
  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    return user !== null;
  }

  /**
   * Set current session (called after login/register success)
   */
  setSession(user: User, token: string, expiresAt: Date): void {
    const previousUser = this.currentSession?.user;

    this.currentSession = {
      user,
      token,
      expiresAt,
    };

    logger.info(`✅ Session set for user: ${user.name} (${user.id})`);

    // Emit events via global event-bus
    if (!previousUser) {
      eventBus.emit("session:login", { user, token, expiresAt });
    } else if (previousUser.id !== user.id) {
      eventBus.emit("session:user-change", {
        previous: previousUser,
        current: user,
      });
    }
  }

  /**
   * Clear current session (logout)
   */
  clearSession(): void {
    const previousUser = this.currentSession?.user;
    this.currentSession = null;

    logger.info("🔓 Session cleared");

    if (previousUser) {
      eventBus.emit("session:logout", { user: previousUser });
    }
  }

  /**
   * Load session from database (app initialization)
   * Finds the most recent active session for humans only
   */
  async loadFromDatabase(): Promise<User | null> {
    try {
      const db = getDatabase();

      // Load from database - find the most recent valid session (apenas humans)
      const [result] = await db
        .select({
          user: usersTable,
          session: userSessionsTable,
        })
        .from(userSessionsTable)
        .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
        .where(
          and(
            isNull(userSessionsTable.deactivatedAt),
            gt(userSessionsTable.expiresAt, new Date()),
            eq(usersTable.type, "human"),
            isNull(usersTable.deactivatedAt),
          ),
        )
        .orderBy(desc(userSessionsTable.createdAt))
        .limit(1);

      if (!result) {
        logger.info("No active session found in database");
        return null;
      }

      // Cache the loaded session
      this.setSession(
        result.user,
        result.session.token,
        result.session.expiresAt,
      );

      logger.info(`🔄 Session loaded from database: ${result.user.name}`);
      return result.user;
    } catch (error) {
      logger.error("Failed to load session from database:", error);
      return null;
    }
  }

  /**
   * Refresh current session by reloading from database
   */
  async refreshSession(): Promise<boolean> {
    const user = await this.loadFromDatabase();
    return user !== null;
  }

  /**
   * Validate current session against database
   */
  async validateSession(): Promise<boolean> {
    if (!this.currentSession) {
      return false;
    }

    try {
      const db = getDatabase();

      // Verify session still exists and is valid in database
      const [sessionExists] = await db
        .select({ id: userSessionsTable.id })
        .from(userSessionsTable)
        .where(
          and(
            eq(userSessionsTable.token, this.currentSession.token),
            isNull(userSessionsTable.deactivatedAt),
            gt(userSessionsTable.expiresAt, new Date()),
          ),
        )
        .limit(1);

      if (!sessionExists) {
        logger.warn("Session validation failed - clearing cache");
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      logger.error("Session validation error:", error);
      return false;
    }
  }

  /**
   * Require authenticated user - throws if not logged in
   */
  requireAuth(): User {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user;
  }

  /**
   * Get session stats for debugging
   */
  getStats(): {
    isLoggedIn: boolean;
    userId: string | null;
    userName: string | null;
    expiresAt: Date | null;
    timeUntilExpiry: number | null;
  } {
    if (!this.currentSession) {
      return {
        isLoggedIn: false,
        userId: null,
        userName: null,
        expiresAt: null,
        timeUntilExpiry: null,
      };
    }

    const now = new Date();
    const timeUntilExpiry =
      this.currentSession.expiresAt.getTime() - now.getTime();

    return {
      isLoggedIn: true,
      userId: this.currentSession.user.id,
      userName: this.currentSession.user.name,
      expiresAt: this.currentSession.expiresAt,
      timeUntilExpiry: timeUntilExpiry > 0 ? timeUntilExpiry : 0,
    };
  }
}

// Global singleton instance
export const sessionRegistry = new SessionRegistry();

// Convenience exports for backward compatibility
export const getCurrentUser = () => sessionRegistry.getCurrentUser();
export const isLoggedIn = () => sessionRegistry.isLoggedIn();
export const requireAuth = () => sessionRegistry.requireAuth();
export const clearSession = () => sessionRegistry.clearSession();
export const loadSessionFromDatabase = () => sessionRegistry.loadFromDatabase();
export const validateSession = () => sessionRegistry.validateSession();
