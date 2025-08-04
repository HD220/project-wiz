import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type InsertUser, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function createUser(data: InsertUser): Promise<SelectUser> {
  const db = getDatabase();

  const [user] = await db
    .insert(usersTable)
    .values(data)
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}