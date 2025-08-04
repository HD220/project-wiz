import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
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