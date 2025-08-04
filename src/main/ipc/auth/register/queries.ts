import bcrypt from "bcryptjs";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";
import { accountsTable } from "@/main/database/schemas/auth.schema";
import { userPreferencesTable } from "@/main/database/schemas/user-preferences.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { eq } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

export interface RegisterData {
  username: string;
  name: string;
  avatar?: string;
  password: string;
}

export interface RegisterResult {
  user: SelectUser;
  sessionToken: string;
}

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
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

export async function createUserAccount(data: RegisterData): Promise<RegisterResult> {
  const db = getDatabase();
  
  // Usar transação síncrona conforme o padrão do AgentService original
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