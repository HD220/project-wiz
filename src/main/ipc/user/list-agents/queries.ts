import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

export async function getAgents(filters: { ownerId?: string, showInactive?: boolean }): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [eq(usersTable.type, "agent")];

  if (!filters.showInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.name);

  return users;
}