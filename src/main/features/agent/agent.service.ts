import { eq, and, desc, like, or } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);
import { agentsTable } from "@/main/features/agent/agent.model";
import type {
  CreateAgentInput,
  SelectAgent,
  AgentStatus,
  AgentWithProvider,
  InsertAgent,
} from "@/main/features/agent/agent.types";
import { createAgentSchema } from "@/main/features/agent/agent.types";
import { llmProvidersTable } from "@/main/features/llm-provider/llm-provider.model";
import { usersTable } from "@/main/features/user/user.model";
import { getLogger } from "@/shared/logger/config";

export class AgentService {
  /**
   * Create a new agent with validation
   */
  static async create(
    input: CreateAgentInput,
    ownerId: string,
  ): Promise<SelectAgent> {
    const log = getLogger("agent.service");

    if (!ownerId) {
      throw new Error("Owner ID is required");
    }

    const validatedInput = createAgentSchema.parse(input);
    const db = getDatabase();

    log.info(
      {
        agentName: validatedInput.name,
        ownerId,
        providerId: validatedInput.providerId,
      },
      "Starting agent creation transaction",
    );

    try {
      return db.transaction((tx) => {
        // Use synchronous operations with better-sqlite3
        const providers = tx
          .select()
          .from(llmProvidersTable)
          .where(
            and(
              eq(llmProvidersTable.id, validatedInput.providerId),
              eq(llmProvidersTable.isActive, true),
            ),
          )
          .limit(1)
          .all();

        const provider = providers[0];

        if (!provider) {
          throw new Error(
            `LLM provider ${validatedInput.providerId} not found or inactive`,
          );
        }

        // Create user for the agent first (synchronous)
        const agentUsers = tx
          .insert(usersTable)
          .values({
            name: validatedInput.name,
            avatar: validatedInput.avatar || "",
            type: "agent",
          })
          .returning()
          .all();

        const agentUser = agentUsers[0];

        if (!agentUser) {
          throw new Error("Failed to create user for agent");
        }

        if (!agentUser.id) {
          throw new Error("Created user missing ID");
        }

        // Generate system prompt
        const systemPrompt = `You are a ${validatedInput.role}. ${validatedInput.backstory}. Your current goal is ${validatedInput.goal}. Always be helpful, professional, and focus on best practices in your domain. Provide clear, actionable advice and maintain a collaborative approach when working with humans and other agents.`;

        // Create the agent record (synchronous)
        const agents = tx
          .insert(agentsTable)
          .values({
            userId: agentUser.id, // Link to the user we just created
            ownerId: ownerId, // Who created this agent
            name: validatedInput.name,
            role: validatedInput.role,
            backstory: validatedInput.backstory,
            goal: validatedInput.goal,
            systemPrompt,
            providerId: validatedInput.providerId,
            modelConfig:
              typeof validatedInput.modelConfig === "string"
                ? validatedInput.modelConfig
                : JSON.stringify(validatedInput.modelConfig),
            status: "inactive" as AgentStatus,
          })
          .returning()
          .all();

        const agent = agents[0];

        if (!agent) {
          throw new Error("Failed to create agent");
        }

        if (!agent.id) {
          throw new Error("Created agent missing ID");
        }

        log.info(
          { agentId: agent.id, agentName: agent.name },
          "Agent creation transaction completed successfully",
        );
        return agent;
      });
    } catch (error) {
      log.error(
        { error, agentName: validatedInput.name, ownerId },
        "Agent creation transaction failed",
      );
      // Re-throw the error to ensure proper error handling up the chain
      throw error;
    }
  }

  /**
   * List agents by owner ID with comprehensive filtering support
   * Only returns active agents by default
   */
  static async listByOwnerId(
    ownerId: string,
    filters?: {
      status?: AgentStatus;
      search?: string;
      includeInactive?: boolean;
    },
  ): Promise<SelectAgent[]> {
    const db = getDatabase();

    const conditions = [eq(agentsTable.ownerId, ownerId)];

    // Filter by active status unless explicitly including inactive
    if (!filters?.includeInactive) {
      conditions.push(eq(agentsTable.isActive, true));
    }

    // Add status filter
    if (filters?.status) {
      conditions.push(eq(agentsTable.status, filters.status));
    }

    // Add search filter (search in name and role)
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      const searchCondition = or(
        like(agentsTable.name, searchTerm),
        like(agentsTable.role, searchTerm),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    return await db
      .select()
      .from(agentsTable)
      .where(and(...conditions))
      .orderBy(desc(agentsTable.createdAt));
  }

  /**
   * Update agent status
   */
  static async updateStatus(
    id: string,
    status: AgentStatus,
  ): Promise<SelectAgent> {
    const db = getDatabase();

    const [record] = await db
      .update(agentsTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
      .returning();

    if (!record) {
      throw new Error("Agent not found, inactive, or update failed");
    }

    return record;
  }

  /**
   * Get agent with provider information
   * Only returns active agents
   */
  static async getWithProvider(id: string): Promise<AgentWithProvider | null> {
    const db = getDatabase();

    const [result] = await db
      .select()
      .from(agentsTable)
      .innerJoin(
        llmProvidersTable,
        eq(agentsTable.providerId, llmProvidersTable.id),
      )
      .where(
        and(
          eq(agentsTable.id, id),
          eq(agentsTable.isActive, true),
          eq(llmProvidersTable.isActive, true),
        ),
      )
      .limit(1);

    if (!result) return null;

    return {
      ...result.agents,
      provider: result.llm_providers,
    };
  }

  /**
   * Find agent by ID
   * Only returns active agents by default
   */
  static async findById(
    id: string,
    includeInactive = false,
  ): Promise<SelectAgent | null> {
    const db = getDatabase();

    const conditions = [eq(agentsTable.id, id)];

    if (!includeInactive) {
      conditions.push(eq(agentsTable.isActive, true));
    }

    const [record] = await db
      .select()
      .from(agentsTable)
      .where(and(...conditions))
      .limit(1);

    return record || null;
  }

  /**
   * Update agent by ID
   * Only updates active agents
   */
  static async update(
    id: string,
    input: Partial<InsertAgent>,
  ): Promise<SelectAgent> {
    const db = getDatabase();

    const [record] = await db
      .update(agentsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
      .returning();

    if (!record) {
      throw new Error("Agent not found, inactive, or update failed");
    }

    return record;
  }

  /**
   * Soft delete agent by ID with cascading deletion
   */
  static async softDelete(id: string, deletedBy: string): Promise<boolean> {
    const log = getLogger("agent.service");
    const db = getDatabase();

    log.info(
      { agentId: id, deletedBy },
      "Starting agent soft delete transaction",
    );

    try {
      return db.transaction((tx) => {
        // Use synchronous operations with better-sqlite3
        const agents = tx
          .select()
          .from(agentsTable)
          .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
          .limit(1)
          .all();

        const agent = agents[0];

        if (!agent) {
          throw new Error("Agent not found or already inactive");
        }

        // Soft delete the agent (synchronous)
        tx.update(agentsTable)
          .set({
            isActive: false,
            deactivatedAt: new Date(),
            deactivatedBy: deletedBy,
            updatedAt: new Date(),
          })
          .where(eq(agentsTable.id, id))
          .run();

        log.info(
          { agentId: id },
          "Agent soft delete transaction completed successfully",
        );
        return true;
      });
    } catch (error) {
      log.error(
        { error, agentId: id, deletedBy },
        "Agent soft delete transaction failed",
      );
      // Re-throw the error to ensure proper error handling up the chain
      throw error;
    }
  }

  /**
   * Restore a soft deleted agent
   */
  static async restore(id: string): Promise<SelectAgent> {
    const db = getDatabase();

    const [restored] = await db
      .update(agentsTable)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
        updatedAt: new Date(),
      })
      .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, false)))
      .returning();

    if (!restored) {
      throw new Error("Agent not found or not in soft deleted state");
    }

    return restored;
  }

  /**
   * Get active agents count for a user
   */
  static async getActiveAgentsCount(ownerId: string): Promise<number> {
    const db = getDatabase();

    const result = await db
      .select({ count: agentsTable.id })
      .from(agentsTable)
      .where(
        and(
          eq(agentsTable.ownerId, ownerId),
          eq(agentsTable.isActive, true),
          eq(agentsTable.status, "active"),
        ),
      );

    return result.length;
  }

  /**
   * Get active agents for a specific conversation
   * Returns agents that are available for conversation participation
   */
  static async getActiveAgentsForConversation(
    _conversationId: string,
  ): Promise<SelectAgent[]> {
    const db = getDatabase();

    // For now, return all active agents
    // In the future, this could be filtered by conversation context or project
    return await db
      .select()
      .from(agentsTable)
      .where(
        and(eq(agentsTable.isActive, true), eq(agentsTable.status, "active")),
      )
      .orderBy(desc(agentsTable.createdAt));
  }

  /**
   * DEPRECATED: Use softDelete instead
   * Hard delete agent by ID - kept for backward compatibility
   */
  static async delete(id: string): Promise<void> {
    const log = getLogger("agent.service");
    log.warn("AgentService.delete() is deprecated. Use softDelete() instead.", {
      agentId: id,
    });
    const db = getDatabase();
    await db.delete(agentsTable).where(eq(agentsTable.id, id));
  }
}
