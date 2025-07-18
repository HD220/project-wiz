import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import {
  usersTable,
  type InsertUser,
} from "@/main/user/authentication/users.schema";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthenticatedUser,
} from "@/main/user/authentication/auth.types";

// Simple in-memory session store for current user
let currentUserId: string | null = null;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterUserInput): Promise<AuthenticatedUser> {
    const db = getDatabase();

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, input.username))
      .limit(1);

    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash password
    const passwordHash = await this.hashPassword(input.password);

    // Create user data
    const userData: InsertUser = {
      username: input.username,
      name: input.name,
      passwordHash,
      avatar: input.avatar,
    };

    // Insert user into database
    const [newUser] = await db.insert(usersTable).values(userData).returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Set current session
    currentUserId = newUser.id;

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }

  /**
   * Login with username and password
   */
  static async login(
    credentials: LoginCredentials,
  ): Promise<AuthenticatedUser> {
    const db = getDatabase();

    // Find user by username
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, credentials.username))
      .limit(1);

    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      credentials.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Set current session
    currentUserId = user.id;

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
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

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
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

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
