import { z } from "zod";
import { eq, desc } from "drizzle-orm";

import { getDatabase } from "../../infrastructure/database";
import { getLogger } from "../../infrastructure/logger";
import { agents, AgentSchema } from "../../persistence/schemas/agents.schema";
import { Agent, AgentData } from "./agent.entity";

const logger = getLogger("agents");

// Schemas para validação
const CreateAgentSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(100),
  goal: z.string().min(10),
  backstory: z.string().min(10),
  llmProviderId: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(100).max(4000).default(1000),
});

const UpdateAgentSchema = CreateAgentSchema.partial();

type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
type UpdateAgentInput = z.infer<typeof UpdateAgentSchema>;

// Helper para converter dados do banco para entidade
function dbToAgentData(dbData: AgentSchema): AgentData {
  return {
    id: dbData.id,
    name: dbData.name,
    role: dbData.role,
    goal: dbData.goal,
    backstory: dbData.backstory,
    llmProviderId: dbData.llmProviderId,
    temperature: dbData.temperature,
    maxTokens: dbData.maxTokens,
    status: dbData.isActive ? "active" : "inactive",
    createdAt: new Date(dbData.createdAt),
    updatedAt: new Date(dbData.updatedAt),
  };
}

// Helper para converter entidade para dados do banco
function agentToDbData(agent: Agent) {
  const data = agent.toData();
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    goal: data.goal,
    backstory: data.backstory,
    llmProviderId: data.llmProviderId,
    temperature: data.temperature,
    maxTokens: data.maxTokens,
    isActive: data.status === "active",
    isDefault: false, // TODO: implementar lógica de default
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
}

// CRUD Operations
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const validated = validateCreateInput(input);
  const dbData = prepareAgentData(validated);
  const result = await insertAgentToDatabase(dbData);
  return buildAgentFromResult(result[0]);
}

function validateCreateInput(input: CreateAgentInput) {
  try {
    return CreateAgentSchema.parse(input);
  } catch (error) {
    logger.error("Invalid agent input", { error, input });
    throw error;
  }
}

function prepareAgentData(validated: CreateAgentInput) {
  const now = new Date().toISOString();
  return {
    ...validated,
    isActive: false,
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };
}

async function insertAgentToDatabase(dbData: any) {
  try {
    const db = getDatabase();
    const result = await db.insert(agents).values(dbData).returning();
    if (!result[0]) {
      throw new Error("Failed to create agent - no result returned");
    }
    return result;
  } catch (error) {
    logger.error("Failed to insert agent", { error, dbData });
    throw error;
  }
}

function buildAgentFromResult(result: any): Agent {
  const agent = new Agent(dbToAgentData(result));
  logger.info(`Agent created: ${agent.getName()}`);
  return agent;
}

export async function findAgentById(id: string): Promise<Agent | null> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return new Agent(dbToAgentData(result[0]));
  } catch (error) {
    logger.error("Failed to find agent", { error, id });
    throw error;
  }
}

export async function findAllAgents(): Promise<Agent[]> {
  try {
    const db = getDatabase();
    const result = await db
      .select()
      .from(agents)
      .orderBy(desc(agents.createdAt));

    return result.map((data) => new Agent(dbToAgentData(data)));
  } catch (error) {
    logger.error("Failed to find agents", { error });
    throw error;
  }
}

export async function updateAgent(
  id: string,
  input: UpdateAgentInput,
): Promise<Agent> {
  const validated = validateUpdateInput(input);
  const updateData = prepareUpdateData(validated);
  const result = await performAgentUpdate(id, updateData);
  return buildAgentFromUpdateResult(result[0]);
}

function validateUpdateInput(input: UpdateAgentInput) {
  try {
    return UpdateAgentSchema.parse(input);
  } catch (error) {
    logger.error("Invalid update input", { error, input });
    throw error;
  }
}

function prepareUpdateData(validated: UpdateAgentInput) {
  return {
    ...validated,
    updatedAt: new Date().toISOString(),
  };
}

async function performAgentUpdate(id: string, updateData: any) {
  try {
    const db = getDatabase();
    const result = await db
      .update(agents)
      .set(updateData)
      .where(eq(agents.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Agent not found: ${id}`);
    }

    return result;
  } catch (error) {
    logger.error("Failed to update agent", { error, id, updateData });
    throw error;
  }
}

function buildAgentFromUpdateResult(result: any): Agent {
  const agent = new Agent(dbToAgentData(result));
  logger.info(`Agent updated: ${agent.getName()}`);
  return agent;
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    const db = getDatabase();
    const result = await db
      .delete(agents)
      .where(eq(agents.id, id))
      .returning({ name: agents.name });

    if (result.length === 0) {
      throw new Error(`Agent not found: ${id}`);
    }

    logger.info(`Agent deleted: ${result[0].name}`);
  } catch (error) {
    logger.error("Failed to delete agent", { error, id });
    throw error;
  }
}

export async function activateAgent(id: string): Promise<Agent> {
  const agent = await findAgentOrThrow(id);
  const activatedAgent = agent.activate();
  return await updateAgentData(activatedAgent);
}

async function findAgentOrThrow(id: string): Promise<Agent> {
  try {
    const agent = await findAgentById(id);
    if (!agent) {
      throw new Error(`Agent not found: ${id}`);
    }
    return agent;
  } catch (error) {
    logger.error("Failed to find agent", { error, id });
    throw error;
  }
}

export async function deactivateAgent(id: string): Promise<Agent> {
  const agent = await findAgentOrThrow(id);
  const deactivatedAgent = agent.deactivate();
  return await updateAgentData(deactivatedAgent);
}

// Helper para atualizar usando dados da entidade
async function updateAgentData(agent: Agent): Promise<Agent> {
  const db = getDatabase();
  const dbData = agentToDbData(agent);

  const result = await db
    .update(agents)
    .set(dbData)
    .where(eq(agents.id, dbData.id))
    .returning();

  if (!result[0]) {
    throw new Error("Failed to update agent - no result returned");
  }

  return new Agent(dbToAgentData(result[0]));
}
