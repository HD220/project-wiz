import { z } from "zod";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { eq, and } from "drizzle-orm";

const { getDatabase } = createDatabaseConnection(true);

// Output validation schema baseado em AuthenticatedUser
export const GetUserByIdOutputSchema = z.object({
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

export type GetUserByIdOutput = z.infer<typeof GetUserByIdOutputSchema>;

export async function getUserById(userId: string): Promise<GetUserByIdOutput> {
  // Validate userId is not empty
  if (!userId || userId.trim() === '') {
    throw new Error("User ID is required");
  }
  
  const db = getDatabase();
  
  // AuthService.getUserById() logic
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.id, userId),
        eq(usersTable.isActive, true)
      )
    )
    .limit(1);
  
  if (!user) {
    return null;
  }
  
  return GetUserByIdOutputSchema.parse(user);
}