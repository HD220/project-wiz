import bcrypt from "bcryptjs";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";
import { accountsTable } from "@/main/database/schemas/auth.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { eq, and } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResult {
  user: SelectUser;
  sessionToken: string;
}

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
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