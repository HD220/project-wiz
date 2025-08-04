import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type InsertUser, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function updateUser(id: string, data: Partial<InsertUser>): Promise<SelectUser | null> {
  const db = getDatabase();

  const [updated] = await db
    .update(usersTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
    .returning();

  return updated || null;
}