import bcrypt from "bcryptjs";
import { eq, and, gt, desc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { usersTable, type SelectUser } from "@/main/schemas/user.schema";
import { accountsTable } from "@/main/schemas/account.schema";
import { userPreferencesTable } from "@/main/schemas/user-preferences.schema";
import { userSessionsTable } from "@/main/schemas/user-sessions.schema";
import { sessionRegistry } from "@/main/services/session-registry";

const { getDatabase } = createDatabaseConnection(true);

// Data interfaces for auth operations
export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  name: string;
  avatar?: string;
  password: string;
}

export interface AuthResult {
  user: SelectUser;
  sessionToken: string;
}

export interface RegisterResult {
  user: SelectUser;
  sessionToken: string;
}

/**
 * Initialize session from database - loads most recent active session
 */
export async function initializeSessionFromDatabase(): Promise<void> {
  const db = getDatabase();
  
  // Find the most recent active session
  const [session] = await db
    .select({
      userId: userSessionsTable.userId,
      token: userSessionsTable.token,
      expiresAt: userSessionsTable.expiresAt,
    })
    .from(userSessionsTable)
    .where(
      and(
        eq(userSessionsTable.isActive, true),
        gt(userSessionsTable.expiresAt, new Date()) // Not expired
      )
    )
    .orderBy(desc(userSessionsTable.createdAt))
    .limit(1);

  if (!session) {
    return; // No active session
  }

  // Load user data and cache it
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, session.userId),
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);

  if (user) {
    sessionRegistry.setSession(user, session.token, session.expiresAt);
  }
}

/**
 * Get current user from session cache
 */
export function getCurrentUserFromCache() {
  return sessionRegistry.getCurrentUser();
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<SelectUser | null> {
  const db = getDatabase();
  
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, userId),
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);
  
  return user || null;
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(data: LoginData): Promise<AuthResult> {
  const db = getDatabase();
  
  // Find user by username - join with accounts and users tables
  const [result] = await db
    .select({
      user: usersTable,
      account: accountsTable,
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
    .where(
      and(
        eq(accountsTable.username, data.username),
        eq(usersTable.type, "human"), // Only humans can login
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);

  if (!result) {
    throw new Error("Invalid username or password");
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(data.password, result.account.passwordHash);
  if (!isValidPassword) {
    throw new Error("Invalid username or password");
  }

  // Create new session token
  const sessionToken = crypto.randomUUID();
  const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(userSessionsTable).values({
    userId: result.user.id,
    token: sessionToken,
    expiresAt,
  });

  return { 
    user: result.user, 
    sessionToken 
  };
}

/**
 * Clear all active user sessions (logout)
 */
export async function clearUserSessions(): Promise<void> {
  const db = getDatabase();
  
  // Clear all active sessions
  await db
    .update(userSessionsTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(userSessionsTable.isActive, true));
}

/**
 * Check if username already exists
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  const db = getDatabase();
  const [existingAccount] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.username, username))
    .limit(1);
  
  return !!existingAccount;
}

/**
 * Create new user account with registration data
 */
export async function createUserAccount(data: RegisterData): Promise<RegisterResult> {
  const db = getDatabase();
  
  // Use synchronous transaction following agent pattern
  return db.transaction((tx) => {
    // 1. Create user
    const users = tx
      .insert(usersTable)
      .values({
        name: data.name,
        avatar: data.avatar || null,
        type: "human",
      })
      .returning()
      .all();

    const user = users[0];
    if (!user?.id) {
      throw new Error("Failed to create user");
    }

    // 2. Create account with hashed password
    const passwordHash = bcrypt.hashSync(data.password, 12);
    const accounts = tx
      .insert(accountsTable)
      .values({
        userId: user.id,
        username: data.username,
        passwordHash,
      })
      .returning()
      .all();

    const account = accounts[0];
    if (!account) {
      throw new Error("Failed to create account");
    }

    // 3. Create preferences
    tx.insert(userPreferencesTable).values({
      userId: user.id,
      theme: "system",
    }).run();

    // 4. Create session token
    const sessionToken = crypto.randomUUID();
    const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    tx.insert(userSessionsTable).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    }).run();

    return { user, sessionToken };
  });
}