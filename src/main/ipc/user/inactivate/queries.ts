import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { dmParticipantsTable } from "@/main/database/schemas/dm-conversation.schema";
import { projectsTable } from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function softDeleteUser(id: string, deletedBy: string): Promise<boolean> {
  const db = getDatabase();

  return db.transaction((tx) => {
    // Verify user exists and is active
    const userResults = tx
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
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
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id))
      .run();

    // 2. Cascade soft delete to owned agents
    tx.update(agentsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(eq(agentsTable.ownerId, id), eq(agentsTable.isActive, true)),
      )
      .run();

    // 3. Cascade soft delete to owned projects
    tx.update(projectsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectsTable.ownerId, id),
          eq(projectsTable.isActive, true),
        ),
      )
      .run();

    // 4. Soft delete user sessions (no updatedAt field in this table)
    tx.update(userSessionsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
      })
      .where(
        and(
          eq(userSessionsTable.userId, id),
          eq(userSessionsTable.isActive, true),
        ),
      )
      .run();

    // 5. Soft delete DM participations
    tx.update(dmParticipantsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dmParticipantsTable.participantId, id),
          eq(dmParticipantsTable.isActive, true),
        ),
      )
      .run();

    // Note: Messages, memories, and other related entities will be handled
    // by their respective services through foreign key cascading

    return true;
  });
}