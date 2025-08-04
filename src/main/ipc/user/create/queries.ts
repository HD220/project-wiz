import { z } from "zod";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable, type InsertUser, type SelectUser } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema (InsertUser)
export const CreateUserInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().nullable().optional(),
  type: z.enum(["human", "agent"])
});

// Output validation schema (SelectUser)
export const CreateUserOutputSchema = z.object({
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

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateUserInputSchema.parse(input);

  const [user] = await db
    .insert(usersTable)
    .values(validatedInput)
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  return CreateUserOutputSchema.parse(user);
}