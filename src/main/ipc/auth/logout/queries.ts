import { createDatabaseConnection } from "@/shared/database/config";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { eq } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

export async function clearUserSessions(): Promise<void> {
  const db = getDatabase();
  
  // Clear all active sessions (AuthService.logout() logic)
  await db
    .update(userSessionsTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(userSessionsTable.isActive, true));
}