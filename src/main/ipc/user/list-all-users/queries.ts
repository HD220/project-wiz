import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ListAllUsersInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false)
});

// Output validation schema (UserSummary[])
export const ListAllUsersOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"])
}));

export type ListAllUsersInput = z.infer<typeof ListAllUsersInputSchema>;
export type ListAllUsersOutput = z.infer<typeof ListAllUsersOutputSchema>;

export async function getAllUsers(input: ListAllUsersInput): Promise<ListAllUsersOutput> {
  const db = getDatabase();
  
  const validatedInput = ListAllUsersInputSchema.parse(input);

  const conditions = [];

  if (!validatedInput.includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
    })
    .from(usersTable)
    .where(whereClause)
    .orderBy(usersTable.name);

  return ListAllUsersOutputSchema.parse(users);
}