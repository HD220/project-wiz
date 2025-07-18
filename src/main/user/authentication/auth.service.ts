import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { usersTable, type SelectUser, type InsertUser } from "./users.schema";
import type {
  LoginCredentials,
  RegisterUserInput,
  AuthResult,
  SessionValidationResult,
} from "./auth.types";

// Simple in-memory session store for current user
let currentUserId: string | null = null;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterUserInput): Promise<AuthResult> {
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.username, input.username),
    });

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

    return {
      user: userWithoutPassword,
    };
  }

  /**
   * Login with username and password
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const db = getDatabase();

    // Find user by username
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.username, credentials.username),
    });

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

    return {
      user: userWithoutPassword,
    };
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<SessionValidationResult> {
    if (!currentUserId) {
      return { valid: false, error: "No user logged in" };
    }

    const db = getDatabase();

    // Find user by ID
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, currentUserId),
    });

    if (!user) {
      // Clear invalid session
      currentUserId = null;
      return { valid: false, error: "User not found" };
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      valid: true,
      user: userWithoutPassword,
    };
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
  static async getUserById(
    userId: string,
  ): Promise<Omit<SelectUser, "passwordHash"> | null> {
    const db = getDatabase();

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return null;
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
