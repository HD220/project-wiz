import { eq, and, ne } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { agentsTable } from "@/main/features/agent/agent.model";
import { usersTable } from "@/main/features/user/user.model";
import type { SelectUser } from "@/main/features/user/user.model";

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
   */
  static async listAllUsers(): Promise<UserSummary[]> {
    const db = getDatabase();

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .orderBy(usersTable.name);
  }

  /**
   * List only human users
   */
  static async listHumans(): Promise<UserSummary[]> {
    const db = getDatabase();

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(eq(usersTable.type, "human"))
      .orderBy(usersTable.name);
  }

  /**
   * List only agent users (for showing in conversation UI)
   */
  static async listAgents(): Promise<UserSummary[]> {
    const db = getDatabase();

    return await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
      })
      .from(usersTable)
      .where(eq(usersTable.type, "agent"))
      .orderBy(usersTable.name);
  }

  /**
   * List available users for conversations (ownership-aware)
   * Returns: my agents + other humans (excludes me and others' agents)
   */
  static async listAvailableUsers(
    currentUserId: string,
  ): Promise<UserSummary[]> {
    const db = getDatabase();

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
      .where(eq(agentsTable.ownerId, currentUserId));

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
        and(eq(usersTable.type, "human"), ne(usersTable.id, currentUserId)),
      );

    // UNION ALL: combine both queries
    const combinedQuery = myAgents.unionAll(otherHumans);

    return await combinedQuery.orderBy(usersTable.name);
  }

  /**
   * Get user by ID (any type)
   */
  static async findById(userId: string): Promise<SelectUser | null> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    return user || null;
  }

  /**
   * Get user by ID with type validation
   */
  static async findByIdAndType(
    userId: string,
    type: "human" | "agent",
  ): Promise<SelectUser | null> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user || user.type !== type) {
      return null;
    }

    return user;
  }
}
