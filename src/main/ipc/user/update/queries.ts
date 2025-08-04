import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type InsertUser, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UpdateUserInputSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  avatar: z.string().nullable().optional(),
  type: z.enum(["human", "agent"]).optional()
});

// Output validation schema (SelectUser)
export const UpdateUserOutputSchema = z.object({
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

export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
export type UpdateUserOutput = z.infer<typeof UpdateUserOutputSchema>;

export async function updateUser(input: UpdateUserInput): Promise<UpdateUserOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateUserInputSchema.parse(input);

  // Extract id and prepare update data
  const { id, ...updateData } = validatedInput;

  const [updated] = await db
    .update(usersTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
    .returning();

  if (!updated) {
    throw new Error("User not found, inactive, or update failed");
  }

  return UpdateUserOutputSchema.parse(updated);
}