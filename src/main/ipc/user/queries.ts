import { eq, and, ne } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { usersTable, type SelectUser, type InsertUser } from "@/main/schemas/user.schema";
import { agentsTable } from "@/main/schemas/agent.schema";
import { userSessionsTable } from "@/main/schemas/user-sessions.schema";
import { dmParticipantsTable } from "@/main/schemas/dm-conversation.schema";
import { projectsTable } from "@/main/schemas/project.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Create a new user
 */
export async function createUser(data: InsertUser): Promise<SelectUser> {
  const db = getDatabase();

  const [user] = await db
    .insert(usersTable)
    .values(data)
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

/**
 * Find user by ID with optional inactive inclusion
 */
export async function findUser(userId: string, includeInactive: boolean = false): Promise<SelectUser | null> {
  const db = getDatabase();

  const conditions = [eq(usersTable.id, userId)];

  if (!includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .limit(1);

  return user || null;
}

/**
 * Find user by ID and type
 */
export async function findUserByIdAndType(input: { 
  userId: string; 
  type: "human" | "agent"; 
  includeInactive?: boolean 
}): Promise<SelectUser | null> {
  const db = getDatabase();

  const conditions = [
    eq(usersTable.id, input.userId), 
    eq(usersTable.type, input.type)
  ];

  if (!input.includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .limit(1);

  return user || null;
}

/**
 * Update user by ID
 */
export async function updateUser(userId: string, data: Partial<InsertUser>): Promise<SelectUser | null> {
  const db = getDatabase();

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const [updatedUser] = await db
    .update(usersTable)
    .set(updateData)
    .where(and(eq(usersTable.id, userId), eq(usersTable.isActive, true)))
    .returning();

  return updatedUser || null;
}

/**
 * List all users with filters
 */
export async function listUsers(filters: { includeInactive?: boolean; type?: "human" | "agent" } = {}): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [];

  if (!filters.includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  if (filters.type) {
    conditions.push(eq(usersTable.type, filters.type));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const users = await db
    .select()
    .from(usersTable)
    .where(whereClause)
    .orderBy(usersTable.name);

  return users;
}

/**
 * Get users by type (humans or agents)
 */
export async function getUsersByType(type: "human" | "agent", includeInactive: boolean = false): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [eq(usersTable.type, type)];

  if (!includeInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.name);

  return users;
}

/**
 * Get available users (excluding current user, including owned agents and other humans)
 */
export async function listAvailableUsers(
  currentUserId: string,
  filters?: { type?: "human" | "agent" }
): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [
    eq(usersTable.isActive, true),
    ne(usersTable.id, currentUserId), // Excluir o usuário atual
  ];

  // Se for filtro por tipo, adiciona a condição
  if (filters?.type) {
    conditions.push(eq(usersTable.type, filters.type));
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.name);

  return users;
}

/**
 * Get agents with optional filters
 */
export async function listAgents(filters: { ownerId?: string; showInactive?: boolean } = {}): Promise<SelectUser[]> {
  const db = getDatabase();

  const conditions = [eq(usersTable.type, "agent")];

  if (!filters.showInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(and(...conditions))
    .orderBy(usersTable.name);

  return users;
}

/**
 * Get user statistics with aggregated data
 */
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

/**
 * Soft delete user (inactivate)
 */
export async function softDeleteUser(userId: string, deactivatedBy: string): Promise<boolean> {
  const db = getDatabase();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      isActive: false,
      deactivatedAt: Date.now(),
      deactivatedBy: deactivatedBy,
      updatedAt: new Date(),
    })
    .where(and(eq(usersTable.id, userId), eq(usersTable.isActive, true)))
    .returning();

  return !!updatedUser;
}

/**
 * Activate user (restore from soft deletion)
 */
export async function activateUser(userId: string): Promise<SelectUser | null> {
  const db = getDatabase();

  const [updatedUser] = await db
    .update(usersTable)
    .set({
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  return updatedUser || null;
}