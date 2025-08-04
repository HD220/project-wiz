import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const RestoreUserInputSchema = z.string().min(1, "User ID is required");

// Output validation schema (SelectUser)
export const RestoreUserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  type: z.enum(["human", "agent"]),
  isActive: z.boolean(),
  deactivatedAt: z.date().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type RestoreUserInput = z.infer<typeof RestoreUserInputSchema>;
export type RestoreUserOutput = z.infer<typeof RestoreUserOutputSchema>;

export async function restoreUser(userId: RestoreUserInput): Promise<RestoreUserOutput> {
  const db = getDatabase();
  
  const validatedUserId = RestoreUserInputSchema.parse(userId);

  const [restored] = await db
    .update(usersTable)
    .set({
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(and(eq(usersTable.id, validatedUserId), eq(usersTable.isActive, false)))
    .returning();

  if (!restored) {
    throw new Error("User not found or not in soft deleted state");
  }

  return RestoreUserOutputSchema.parse(restored);
}