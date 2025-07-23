import bcrypt from "bcryptjs";
import { eq, and, gt, desc } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { accountsTable } from "@/main/features/auth/auth.model";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthenticatedUser,
  AuthResult,
} from "@/main/features/auth/auth.types";
import { sessionManager } from "@/main/features/auth/session-manager";
import { userSessionsTable } from "@/main/features/auth/user-sessions.model";
import { userPreferencesTable } from "@/main/features/user/profile.model";
import { usersTable } from "@/main/features/user/user.model";

// Session token duration (30 days)
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterUserInput): Promise<AuthResult> {
    const db = getDatabase();

    // Check if username already exists
    const [existingAccount] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.username, input.username))
      .limit(1);

    if (existingAccount) {
      throw new Error("Username already exists");
    }

    // 1. Create user
    const [user] = await db
      .insert(usersTable)
      .values({
        name: input.name,
        avatar: input.avatar,
        type: "human",
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    // 2. Create account
    const passwordHash = await this.hashPassword(input.password);
    const [account] = await db
      .insert(accountsTable)
      .values({
        userId: user.id,
        username: input.username,
        passwordHash,
      })
      .returning();

    if (!account) {
      throw new Error("Failed to create account");
    }

    // 3. Create preferences
    await db.insert(userPreferencesTable).values({
      userId: user.id,
      theme: "system",
    });

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(userSessionsTable).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    });

    // Set session in memory for desktop app
    sessionManager.setSession(user, sessionToken);

    return { user, sessionToken };
  }

  /**
   * Login with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const db = getDatabase();

    // Buscar por username na tabela accounts (apenas humans podem fazer login)
    const [result] = await db
      .select({
        account: accountsTable,
        user: usersTable,
      })
      .from(accountsTable)
      .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(
        and(
          eq(accountsTable.username, credentials.username),
          eq(usersTable.type, "human"),
        ),
      )
      .limit(1);

    if (!result) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      credentials.password,
      result.account.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Create session token
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(userSessionsTable).values({
      userId: result.user.id,
      token: sessionToken,
      expiresAt,
    });

    // Set session in memory for desktop app
    sessionManager.setSession(result.user, sessionToken);

    return { user: result.user, sessionToken };
  }

  /**
   * Get current authenticated user by session token
   */
  static async getCurrentUser(
    sessionToken: string,
  ): Promise<AuthenticatedUser> {
    if (!sessionToken) {
      throw new Error("No session token provided");
    }

    const db = getDatabase();

    // Find valid session with user (apenas humans têm sessões)
    const [result] = await db
      .select({
        user: usersTable,
        session: userSessionsTable,
      })
      .from(userSessionsTable)
      .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(userSessionsTable.token, sessionToken),
          gt(userSessionsTable.expiresAt, new Date()),
          eq(usersTable.type, "human"),
        ),
      )
      .limit(1);

    if (!result) {
      throw new Error("Invalid or expired session");
    }

    return result.user;
  }

  /**
   * Logout user by removing session token
   */
  static async logout(sessionToken?: string): Promise<void> {
    const db = getDatabase();

    // For desktop app, use internal session token if not provided
    const tokenToLogout =
      sessionToken || sessionManager.getCurrentSessionToken();

    if (tokenToLogout) {
      // Remove session from database
      await db
        .delete(userSessionsTable)
        .where(eq(userSessionsTable.token, tokenToLogout));
    }

    // Clear internal session for desktop app
    sessionManager.clearSession();
  }

  /**
   * Check if session token is valid
   */
  static async isLoggedIn(sessionToken: string): Promise<boolean> {
    if (!sessionToken) {
      return false;
    }

    const db = getDatabase();

    const [session] = await db
      .select({ id: userSessionsTable.id })
      .from(userSessionsTable)
      .where(
        and(
          eq(userSessionsTable.token, sessionToken),
          gt(userSessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return !!session;
  }

  /**
   * Hash password using bcrypt
   */
  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  private static async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Get active session for desktop app
   * Since this is a desktop app, we can get the most recent valid session
   */
  static async getActiveSession(): Promise<{
    user: AuthenticatedUser;
    sessionToken: string;
  } | null> {
    const db = getDatabase();

    // Find the most recent valid session (apenas humans)
    const [result] = await db
      .select({
        user: usersTable,
        session: userSessionsTable,
      })
      .from(userSessionsTable)
      .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
      .where(
        and(
          gt(userSessionsTable.expiresAt, new Date()),
          eq(usersTable.type, "human"),
        ),
      )
      .orderBy(desc(userSessionsTable.createdAt))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      user: result.user,
      sessionToken: result.session.token,
    };
  }

  /**
   * Get human user by ID (utility method)
   */
  static async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.type, "human")))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }

  // === ELECTRON DESKTOP METHODS (No session token required from frontend) ===

  /**
   * Get current user for desktop app (uses internal session)
   */
  static getCurrentUserDesktop(): AuthenticatedUser | null {
    return sessionManager.getCurrentUser();
  }

  /**
   * Check if user is logged in for desktop app (uses internal session)
   */
  static isLoggedInDesktop(): boolean {
    return sessionManager.isLoggedIn();
  }

  /**
   * Initialize session manager on app startup
   */
  static async initializeSession(): Promise<void> {
    await sessionManager.loadSessionFromDatabase();
  }

  /**
   * Logout for desktop app (clears internal session)
   */
  static async logoutDesktop(): Promise<void> {
    await this.logout(); // Uses internal session token
  }
}
