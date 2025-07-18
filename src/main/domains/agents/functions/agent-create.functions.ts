import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { agents } from "@/main/persistence/schemas/agents.schema";
import { Agent, AgentEntityData } from "../agent.entity";
import { AgentDataSchema } from "../value-objects/agent-values";

const logger = getLogger("agents.create");

export type CreateAgentData = {
  name: string;
  role: string;
  goal: string;
  backstory: string;
  llmProviderId: string;
  temperature?: number;
  maxTokens?: number;
};

export async function createAgent(data: CreateAgentData): Promise<Agent> {
  try {
    // Validate using consolidated schema
    const validated = AgentDataSchema.parse({
      ...data,
      status: "inactive" as const,
    });

    const db = getDatabase();
    const now = new Date();

    const result = await db
      .insert(agents)
      .values({
        ...validated,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const agentData: AgentEntityData = {
      id: result[0].id,
      name: result[0].name,
      role: result[0].role,
      goal: result[0].goal,
      backstory: result[0].backstory,
      llmProviderId: result[0].llmProviderId,
      temperature: result[0].temperature,
      maxTokens: result[0].maxTokens,
      status: result[0].status as "active" | "inactive" | "busy",
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    };

    logger.info(`Agent created: ${validated.name}`);
    return new Agent(agentData);
  } catch (error) {
    logger.error("Failed to create agent", { error, data });
    throw error;
  }
}
