import { eq, and, ne } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { agentsTable } from "@/main/features/agent/agent.model";
import { userSessionsTable } from "@/main/features/auth/user-sessions.model";
import { conversationParticipantsTable } from "@/main/features/conversation/conversation.model";
import { projectsTable } from "@/main/features/project/project.model";
import { usersTable } from "@/main/features/user/user.model";
import type { SelectUser, InsertUser } from "@/main/features/user/user.model";

export interface UserSummary {
  id: string;
  name: string;
  avatar: string | null;
  type: "human" | "agent";
}

export class UserService {
  /**
   * List all users (for communication context)
   * Returns both humans and agents as potential conversation participants
   * Only returns active users by default
   */
  static async listAllUsers(includeInactive = false): Promise<UserSummary[]> {
    const db = getDatabase();

    const conditions = [];

    if (!includeInactive) {
      conditions.push(eq(usersTable.isActive, true));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(whereClause)
      .orderBy(usersTable.name);
  }

  /**
   * List only human users
   * Only returns active users by default
   */
  static async listHumans(includeInactive = false): Promise<UserSummary[]> {
    const db = getDatabase();

    const conditions = [eq(usersTable.type, "human")];

    if (!includeInactive) {
      conditions.push(eq(usersTable.isActive, true));
    }

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(and(...conditions))
      .orderBy(usersTable.name);
  }

  /**
   * List only agent users (for showing in conversation UI)
   * Only returns active users by default
   */
  static async listAgents(includeInactive = false): Promise<UserSummary[]> {
    const db = getDatabase();

    const conditions = [eq(usersTable.type, "agent")];

    if (!includeInactive) {
      conditions.push(eq(usersTable.isActive, true));
    }

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(and(...conditions))
      .orderBy(usersTable.name);
  }

  /**
   * List available users for conversations (ownership-aware)
   * Returns: my agents + other humans (excludes me and others' agents)
   * Only returns active users and agents
   */
  static async listAvailableUsers(
    currentUserId: string,
    includeInactive = false,
  ): Promise<UserSummary[]> {
    const db = getDatabase();

    // Base conditions for active status
    const userActiveCondition = includeInactive
      ? []
      : [eq(usersTable.isActive, true)];
    const agentActiveCondition = includeInactive
      ? []
      : [eq(agentsTable.isActive, true)];

    // Part 1: My agents (JOIN with agents table)
    const myAgents = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .innerJoin(agentsTable, eq(usersTable.id, agentsTable.userId))
      .where(
        and(
          eq(agentsTable.ownerId, currentUserId),
          ...userActiveCondition,
          ...agentActiveCondition,
        ),
      );

    // Part 2: Other humans (excluding myself)
    const otherHumans = db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.type, "human"),
          ne(usersTable.id, currentUserId),
          ...userActiveCondition,
        ),
      );

    // UNION ALL: combine both queries
    const combinedQuery = myAgents.unionAll(otherHumans);

    return await combinedQuery.orderBy(usersTable.name);
  }

  /**
   * Get user by ID (any type)
   * Only returns active users by default
   */
  static async findById(
    userId: string,
    includeInactive = false,
  ): Promise<SelectUser | null> {
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
   * Get user by ID with type validation
   * Only returns active users by default
   */
  static async findByIdAndType(
    userId: string,
    type: "human" | "agent",
    includeInactive = false,
  ): Promise<SelectUser | null> {
    const db = getDatabase();

    const conditions = [eq(usersTable.id, userId), eq(usersTable.type, type)];

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
   * Create a new user
   */
  static async create(input: InsertUser): Promise<SelectUser> {
    const db = getDatabase();

    const [user] = await db.insert(usersTable).values(input).returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  /**
   * Update user information
   * Only updates active users
   */
  static async update(
    id: string,
    input: Partial<InsertUser>,
  ): Promise<SelectUser> {
    const db = getDatabase();

    const [updated] = await db
      .update(usersTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(usersTable.id, id), eq(usersTable.isActive, true)))
      .returning();

    if (!updated) {
      throw new Error("User not found, inactive, or update failed");
    }

    return updated;
  }

  /**
   * Soft delete user with comprehensive cascading deletion
   * This will soft delete all owned entities
   */
  static async softDelete(userId: string, deletedBy: string): Promise<void> {
    const db = getDatabase();

    await db.transaction(async (tx) => {
      // Verify user exists and is active
      const [user] = await tx
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.id, userId), eq(usersTable.isActive, true)))
        .limit(1);

      if (!user) {
        throw new Error("User not found or already inactive");
      }

      // 1. Soft delete the user
      await tx
        .update(usersTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId));

      // 2. Cascade soft delete to owned agents
      await tx
        .update(agentsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(eq(agentsTable.ownerId, userId), eq(agentsTable.isActive, true)),
        );

      // 3. Cascade soft delete to owned projects
      await tx
        .update(projectsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projectsTable.ownerId, userId),
            eq(projectsTable.isActive, true),
          ),
        );

      // 4. Soft delete user sessions (no updatedAt field in this table)
      await tx
        .update(userSessionsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
        })
        .where(
          and(
            eq(userSessionsTable.userId, userId),
            eq(userSessionsTable.isActive, true),
          ),
        );

      // 5. Soft delete conversation participations
      await tx
        .update(conversationParticipantsTable)
        .set({
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: deletedBy,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(conversationParticipantsTable.participantId, userId),
            eq(conversationParticipantsTable.isActive, true),
          ),
        );

      // Note: Messages, memories, and other related entities will be handled
      // by their respective services through foreign key cascading
    });
  }

  /**
   * Restore a soft deleted user
   * Note: This does NOT automatically restore cascaded entities
   */
  static async restore(userId: string): Promise<SelectUser> {
    const db = getDatabase();

    const [restored] = await db
      .update(usersTable)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedAt: new Date(),
      })
      .where(and(eq(usersTable.id, userId), eq(usersTable.isActive, false)))
      .returning();

    if (!restored) {
      throw new Error("User not found or not in soft deleted state");
    }

    return restored;
  }

  /**
   * Get user statistics including soft deletion info
   */
  static async getUserStats(userId: string): Promise<{
    ownedAgents: { active: number; inactive: number };
    ownedProjects: { active: number; inactive: number };
    activeSessions: number;
    conversationParticipations: { active: number; inactive: number };
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

    // Count conversation participations
    const participationsActive = await db
      .select({ count: conversationParticipantsTable.id })
      .from(conversationParticipantsTable)
      .where(
        and(
          eq(conversationParticipantsTable.participantId, userId),
          eq(conversationParticipantsTable.isActive, true),
        ),
      );

    const participationsInactive = await db
      .select({ count: conversationParticipantsTable.id })
      .from(conversationParticipantsTable)
      .where(
        and(
          eq(conversationParticipantsTable.participantId, userId),
          eq(conversationParticipantsTable.isActive, false),
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
      conversationParticipations: {
        active: participationsActive.length,
        inactive: participationsInactive.length,
      },
    };
  }
}
