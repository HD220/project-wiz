import { eq, and, desc, like, or } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent,
  type AgentStatus
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function listAgents(filters: {
  ownerId: string;
  status?: AgentStatus;
  search?: string;
  showInactive?: boolean;
}): Promise<SelectAgent[]> {
  const db = getDatabase();

  const conditions = [eq(agentsTable.ownerId, filters.ownerId)];

  // Filter by active status unless explicitly including inactive
  if (!filters.showInactive) {
    conditions.push(eq(agentsTable.isActive, true));
  }

  // Add status filter
  if (filters.status) {
    conditions.push(eq(agentsTable.status, filters.status));
  }

  // Add search filter (search in name and role)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    const searchCondition = or(
      like(agentsTable.name, searchTerm),
      like(agentsTable.role, searchTerm),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const agents = await db
    .select()
    .from(agentsTable)
    .where(and(...conditions))
    .orderBy(desc(agentsTable.createdAt));

  return agents;
}