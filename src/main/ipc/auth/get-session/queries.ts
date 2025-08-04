import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { sessionRegistry } from "@/main/services/session-registry";
import { eq, and, gt, desc } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

export async function initializeSessionFromDatabase(): Promise<void> {
  const db = getDatabase();
  
  // AuthService.initializeSession() logic
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

export function getCurrentUserFromCache() {
  return sessionRegistry.getCurrentUser();
}