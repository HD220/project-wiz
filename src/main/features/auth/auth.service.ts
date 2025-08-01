import bcrypt from "bcryptjs";
import { eq, and, gt, desc } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);
import { accountsTable } from "@/main/features/auth/auth.model";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthenticatedUser,
  AuthResult,
} from "@/main/features/auth/auth.types";
import { sessionCache } from "@/main/features/auth/session-manager";
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
    const passwordHash = await bcrypt.hash(input.password, 12);
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

    // Cache session for desktop app
    sessionCache.set(user);

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
    const isPasswordValid = await bcrypt.compare(
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

    // Cache session for desktop app
    sessionCache.set(result.user);

    return { user: result.user, sessionToken };
  }

  /**
   * Get current authenticated user (uses cache first, then database)
   */
  static async getCurrentUser(): Promise<AuthenticatedUser | null> {
    // Try cache first
    const cachedUser = sessionCache.get();
    if (cachedUser) {
      return cachedUser;
    }

    // Load from database
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

    if (result) {
      // Cache the user
      sessionCache.set(result.user);
      return result.user;
    }

    return null;
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    const db = getDatabase();
    const currentUser = sessionCache.get();

    if (currentUser) {
      // Remove all sessions for this user
      await db
        .delete(userSessionsTable)
        .where(eq(userSessionsTable.userId, currentUser.id));
    }

    // Clear cache
    sessionCache.clear();
  }

  /**
   * Check if user is currently logged in
   */
  static isLoggedIn(): boolean {
    return sessionCache.get() !== null;
  }

  /**
   * Get user by ID (utility method)
   */
  static async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, userId), eq(usersTable.type, "human")))
      .limit(1);

    return user || null;
  }

  /**
   * Initialize session on app startup
   */
  static async initializeSession(): Promise<void> {
    await this.getCurrentUser(); // This will load from database and cache
  }
}
