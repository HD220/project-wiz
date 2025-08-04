import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { dmParticipantsTable } from "@/main/database/schemas/dm-conversation.schema";
import { projectsTable } from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const SoftDeleteUserInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  deletedBy: z.string().min(1, "Deleted by user ID is required")
});

// Output validation schema
export const SoftDeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type SoftDeleteUserInput = z.infer<typeof SoftDeleteUserInputSchema>;
export type SoftDeleteUserOutput = z.infer<typeof SoftDeleteUserOutputSchema>;

export async function softDeleteUser(input: SoftDeleteUserInput): Promise<SoftDeleteUserOutput> {
  const db = getDatabase();
  
  const validatedInput = SoftDeleteUserInputSchema.parse(input);

  return db.transaction((tx) => {
    // Verify user exists and is active
    const userResults = tx
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, validatedInput.userId), eq(usersTable.isActive, true)))
      .limit(1)
      .all();

    const [user] = userResults;
    if (!user) {
      throw new Error("User not found or already inactive");
    }

    // 1. Soft delete the user
    tx.update(usersTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, validatedInput.userId))
      .run();

    // 2. Cascade soft delete to owned agents
    tx.update(agentsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(eq(agentsTable.ownerId, validatedInput.userId), eq(agentsTable.isActive, true)),
      )
      .run();

    // 3. Cascade soft delete to owned projects
    tx.update(projectsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectsTable.ownerId, validatedInput.userId),
          eq(projectsTable.isActive, true),
        ),
      )
      .run();

    // 4. Soft delete user sessions (no updatedAt field in this table)
    tx.update(userSessionsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
      })
      .where(
        and(
          eq(userSessionsTable.userId, validatedInput.userId),
          eq(userSessionsTable.isActive, true),
        ),
      )
      .run();

    // 5. Soft delete DM participations
    tx.update(dmParticipantsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: validatedInput.deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dmParticipantsTable.participantId, validatedInput.userId),
          eq(dmParticipantsTable.isActive, true),
        ),
      )
      .run();

    // Note: Messages, memories, and other related entities will be handled
    // by their respective services through foreign key cascading

    return SoftDeleteUserOutputSchema.parse({
      success: true,
      message: "User soft deleted successfully with cascading"
    });
  });
}