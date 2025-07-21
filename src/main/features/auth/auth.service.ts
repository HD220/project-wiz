import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { accountsTable } from "@/main/user/authentication/accounts.schema";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthenticatedUser,
} from "@/main/user/authentication/auth.types";
import { userPreferencesTable } from "@/main/user/profile/user-preferences.schema";
import { usersTable } from "@/main/user/users.schema";

// Simple in-memory session store for current user
let currentUserId: string | null = null;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterUserInput): Promise<AuthenticatedUser> {
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

    // Set current session
    currentUserId = user.id;

    return user;
  }

  /**
   * Login with username and password
   */
  static async login(
    credentials: LoginCredentials,
  ): Promise<AuthenticatedUser> {
    const db = getDatabase();

    // Buscar por username na tabela accounts
    const [result] = await db
      .select({
        account: accountsTable,
        user: usersTable,
      })
      .from(accountsTable)
      .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(eq(accountsTable.username, credentials.username))
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

    // Set current session
    currentUserId = result.user.id;

    return result.user;
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<AuthenticatedUser> {
    if (!currentUserId) {
      throw new Error("No user logged in");
    }

    const db = getDatabase();

    // Find user by ID
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentUserId))
      .limit(1);

    if (!user) {
      // Clear invalid session
      currentUserId = null;
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Logout current user
   */
  static logout(): void {
    currentUserId = null;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn(): boolean {
    return currentUserId !== null;
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
   * Get user by ID (utility method)
   */
  static async getUserById(userId: string): Promise<AuthenticatedUser | null> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }
}
