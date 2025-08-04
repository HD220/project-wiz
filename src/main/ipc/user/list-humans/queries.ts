import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const ListHumansInputSchema = z.object({
  includeInactive: z.boolean().optional().default(false)
});

// Output validation schema (UserSummary[])
export const ListHumansOutputSchema = z.array(z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"])
}));

export type ListHumansInput = z.infer<typeof ListHumansInputSchema>;
export type ListHumansOutput = z.infer<typeof ListHumansOutputSchema>;

export async function getHumans(input: ListHumansInput): Promise<ListHumansOutput> {
  const db = getDatabase();
  
  const validatedInput = ListHumansInputSchema.parse(input);

  const conditions = [eq(usersTable.type, "human")];

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

  return ListHumansOutputSchema.parse(users);
}