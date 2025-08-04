import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function restoreUser(id: string): Promise<SelectUser | null> {
  const db = getDatabase();

  const [restored] = await db
    .update(usersTable)
    .set({
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(and(eq(usersTable.id, id), eq(usersTable.isActive, false)))
    .returning();

  return restored || null;
}