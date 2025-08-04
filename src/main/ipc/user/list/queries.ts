import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getAllUsers(includeInactive: boolean = false): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [];

  if (!includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select()
    .from(usersTable)
    .where(whereClause)
    .orderBy(usersTable.name);

  return users;
}