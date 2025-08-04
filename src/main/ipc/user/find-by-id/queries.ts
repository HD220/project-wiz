import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const FindUserByIdInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  includeInactive: z.boolean().optional().default(false)
});

// Output validation schema (SelectUser nullable)
export const FindUserByIdOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).nullable();

export type FindUserByIdInput = z.infer<typeof FindUserByIdInputSchema>;
export type FindUserByIdOutput = z.infer<typeof FindUserByIdOutputSchema>;

export async function getUserById(input: FindUserByIdInput): Promise<FindUserByIdOutput> {
  const db = getDatabase();
  
  const validatedInput = FindUserByIdInputSchema.parse(input);

  const conditions = [eq(usersTable.id, validatedInput.userId)];

  if (!validatedInput.includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .limit(1);

  if (!user) {
    return null;
  }

  return FindUserByIdOutputSchema.parse(user);
}