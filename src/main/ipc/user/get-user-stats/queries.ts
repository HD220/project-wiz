import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { usersTable } from "@/main/database/schemas/user.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";
import { userSessionsTable } from "@/main/database/schemas/user-sessions.schema";
import { dmParticipantsTable } from "@/main/database/schemas/dm-conversation.schema";
import { projectsTable } from "@/main/database/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

export async function getUserStats(userId: string): Promise<{
  ownedAgents: {
    active: number;
    inactive: number;
  };
  ownedProjects: {
    active: number;
    inactive: number;
  };
  activeSessions: number;
  dmParticipations: {
    active: number;
    inactive: number;
  };
}> {
  const db = getDatabase();

  // Count owned agents
  const ownedAgentsActive = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(eq(agentsTable.ownerId, userId), eq(agentsTable.isActive, true)),
    );

  const ownedAgentsInactive = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(eq(agentsTable.ownerId, userId), eq(agentsTable.isActive, false)),
    );

  // Count owned projects
  const ownedProjectsActive = await db
    .select({ count: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.ownerId, userId),
        eq(projectsTable.isActive, true),
      ),
    );

  const ownedProjectsInactive = await db
    .select({ count: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.ownerId, userId),
        eq(projectsTable.isActive, false),
      ),
    );

  // Count active sessions
  const activeSessions = await db
    .select({ count: userSessionsTable.id })
    .from(userSessionsTable)
    .where(
      and(
        eq(userSessionsTable.userId, userId),
        eq(userSessionsTable.isActive, true),
      ),
    );

  // Count DM participations
  const participationsActive = await db
    .select({ count: dmParticipantsTable.id })
    .from(dmParticipantsTable)
    .where(
      and(
        eq(dmParticipantsTable.participantId, userId),
        eq(dmParticipantsTable.isActive, true),
      ),
    );

  const participationsInactive = await db
    .select({ count: dmParticipantsTable.id })
    .from(dmParticipantsTable)
    .where(
      and(
        eq(dmParticipantsTable.participantId, userId),
        eq(dmParticipantsTable.isActive, false),
      ),
    );

  return {
    ownedAgents: {
      active: ownedAgentsActive.length,
      inactive: ownedAgentsInactive.length,
    },
    ownedProjects: {
      active: ownedProjectsActive.length,
      inactive: ownedProjectsInactive.length,
    },
    activeSessions: activeSessions.length,
    dmParticipations: {
      active: participationsActive.length,
      inactive: participationsInactive.length,
    },
  };
}