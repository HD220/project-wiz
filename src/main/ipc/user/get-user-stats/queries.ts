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
export const GetUserStatsInputSchema = z.string().min(1, "User ID is required");

// Output validation schema
export const GetUserStatsOutputSchema = z.object({
  ownedAgents: z.object({
    active: z.number(),
    inactive: z.number()
  }),
  ownedProjects: z.object({
    active: z.number(), 
    inactive: z.number()
  }),
  activeSessions: z.number(),
  dmParticipations: z.object({
    active: z.number(),
    inactive: z.number()
  })
});

export type GetUserStatsInput = z.infer<typeof GetUserStatsInputSchema>;
export type GetUserStatsOutput = z.infer<typeof GetUserStatsOutputSchema>;

export async function getUserStats(userId: GetUserStatsInput): Promise<GetUserStatsOutput> {
  const db = getDatabase();
  
  const validatedUserId = GetUserStatsInputSchema.parse(userId);

  // Count owned agents
  const ownedAgentsActive = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(eq(agentsTable.ownerId, validatedUserId), eq(agentsTable.isActive, true)),
    );

  const ownedAgentsInactive = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(eq(agentsTable.ownerId, validatedUserId), eq(agentsTable.isActive, false)),
    );

  // Count owned projects
  const ownedProjectsActive = await db
    .select({ count: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.ownerId, validatedUserId),
        eq(projectsTable.isActive, true),
      ),
    );

  const ownedProjectsInactive = await db
    .select({ count: projectsTable.id })
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.ownerId, validatedUserId),
        eq(projectsTable.isActive, false),
      ),
    );

  // Count active sessions
  const activeSessions = await db
    .select({ count: userSessionsTable.id })
    .from(userSessionsTable)
    .where(
      and(
        eq(userSessionsTable.userId, validatedUserId),
        eq(userSessionsTable.isActive, true),
      ),
    );

  // Count DM participations
  const participationsActive = await db
    .select({ count: dmParticipantsTable.id })
    .from(dmParticipantsTable)
    .where(
      and(
        eq(dmParticipantsTable.participantId, validatedUserId),
        eq(dmParticipantsTable.isActive, true),
      ),
    );

  const participationsInactive = await db
    .select({ count: dmParticipantsTable.id })
    .from(dmParticipantsTable)
    .where(
      and(
        eq(dmParticipantsTable.participantId, validatedUserId),
        eq(dmParticipantsTable.isActive, false),
      ),
    );

  const stats = {
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

  return GetUserStatsOutputSchema.parse(stats);
}