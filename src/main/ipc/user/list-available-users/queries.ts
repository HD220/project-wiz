import { z } from "zod";
import { eq, and, ne } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema (opcional)
export const ListAvailableUsersInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false),
}).optional();

// Output validation schema baseado em UserSummary[]
export const ListAvailableUsersOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
}));

export type ListAvailableUsersInput = z.infer<typeof ListAvailableUsersInputSchema>;
export type ListAvailableUsersOutput = z.infer<typeof ListAvailableUsersOutputSchema>;

export async function getAvailableUsers(
  currentUserId: string,
  params?: ListAvailableUsersInput
): Promise<ListAvailableUsersOutput> {
  const db = getDatabase();
  const includeInactive = params?.includeInactive || false;

  // Base conditions for active status (UserService.listAvailableUsers logic)
  const userActiveCondition = includeInactive
    ? []
    : [eq(usersTable.isActive, true)];
  const agentActiveCondition = includeInactive
    ? []
    : [eq(agentsTable.isActive, true)];

  // Part 1: My agents (JOIN with agents table)
  const myAgents = db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
    })
    .from(usersTable)
    .innerJoin(agentsTable, eq(usersTable.id, agentsTable.userId))
    .where(
      and(
        eq(agentsTable.ownerId, currentUserId),
        ...userActiveCondition,
        ...agentActiveCondition,
      ),
    );

  // Part 2: Other humans (excluding myself)
  const otherHumans = db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
    })
    .from(usersTable)
    .where(
      and(
        eq(usersTable.type, "human"),
        ne(usersTable.id, currentUserId),
        ...userActiveCondition,
      ),
    );

  // UNION ALL: combine both queries
  const combinedQuery = myAgents.unionAll(otherHumans);
  const result = await combinedQuery.orderBy(usersTable.name);

  return ListAvailableUsersOutputSchema.parse(result);
}