import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ListAgentsInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false)
});

// Output validation schema (UserSummary[])
export const ListAgentsOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"])
}));

export type ListAgentsInput = z.infer<typeof ListAgentsInputSchema>;
export type ListAgentsOutput = z.infer<typeof ListAgentsOutputSchema>;

export async function getAgents(input: ListAgentsInput): Promise<ListAgentsOutput> {
  const db = getDatabase();
  
  const validatedInput = ListAgentsInputSchema.parse(input);

  const conditions = [eq(usersTable.type, "agent")];

  if (!validatedInput.includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
    })
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.name);

  return ListAgentsOutputSchema.parse(users);
}