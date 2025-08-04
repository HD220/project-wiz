import { eq, and, ne } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getAvailableUsers(
  currentUserId: string,
  filters?: { type?: "human" | "agent" }
): Promise<SelectUser[]> {
  const db = getDatabase();

  // Base conditions for active status only
  const userActiveCondition = [eq(usersTable.isActive, true)];
  const agentActiveCondition = [eq(agentsTable.isActive, true)];

  // Part 1: My agents (JOIN with agents table)
  const myAgents = db
    .select()
    .from(usersTable)
    .innerJoin(agentsTable, eq(usersTable.id, agentsTable.userId))
    .where(
      and(
        eq(agentsTable.ownerId, currentUserId),
        ...userActiveCondition,
        ...agentActiveCondition,
        filters?.type ? eq(usersTable.type, filters.type) : undefined,
      ),
    );

  // Part 2: Other humans (excluding myself)
  const otherHumans = db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.type, "human"),
        ne(usersTable.id, currentUserId),
        ...userActiveCondition,
        filters?.type ? eq(usersTable.type, filters.type) : undefined,
      ),
    );

  // UNION ALL: combine both queries
  const combinedQuery = myAgents.unionAll(otherHumans);
  const result = await combinedQuery.orderBy(usersTable.name);

  return result.map(row => row.users);
}