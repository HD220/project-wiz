import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getUserById(userId: string, includeInactive: boolean = false): Promise<SelectUser | null> {
  const db = getDatabase();

  const conditions = [eq(usersTable.id, userId)];

  if (!includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .limit(1);

  return user || null;
}