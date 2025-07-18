import { eq, and } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { agents } from "./agents.schema";
import { projectAgents } from "../../project/members/project-agents.schema";
import { z } from "zod";

// Simple ID generator
function generateId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple validation schemas
const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  role: z.enum(["developer", "designer", "tester", "architect", "pm"]),
  expertise: z.array(z.string()).optional(),
  personality: z.string().optional(),
  systemPrompt: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  llmProvider: z.enum(["openai", "deepseek"]).default("deepseek"),
  llmModel: z.string().default("deepseek-chat"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(8000).default(4000),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;

/**
 * Create new agent
 * KISS approach: Simple function that does one thing well
 */
export async function createAgent(
  input: CreateAgentInput,
  createdBy: string,
): Promise<any> {
  // 1. Validate input
  const validated = CreateAgentSchema.parse(input);

  // 2. Check business rules
  await validateAgentLimits(createdBy);

  // 3. Create agent
  const db = getDatabase();
  const agentId = generateId();
  const now = new Date();

  const newAgent = {
    id: agentId,
    name: validated.name,
    description: validated.description,
    role: validated.role,
    expertise: validated.expertise ? JSON.stringify(validated.expertise) : null,
    personality: validated.personality,
    systemPrompt:
      validated.systemPrompt || generateDefaultSystemPrompt(validated),
    avatarUrl: validated.avatarUrl,
    status: "online" as const,
    isGlobal: true,
    llmProvider: validated.llmProvider,
    llmModel: validated.llmModel,
    temperature: validated.temperature,
    maxTokens: validated.maxTokens,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(agents).values(newAgent);

  // 4. TODO: Start agent worker

  return newAgent;
}

/**
 * Find agent by ID
 */
export async function findAgentById(agentId: string): Promise<any | null> {
  const db = getDatabase();

  const agent = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
  });

  if (!agent) return null;

  return {
    ...agent,
    expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
  };
}

/**
 * Find agents by user
 */
export async function findAgentsByUser(userId: string): Promise<any[]> {
  const db = getDatabase();

  const userAgents = await db.query.agents.findMany({
    where: and(eq(agents.createdBy, userId), eq(agents.isGlobal, true)),
    orderBy: [agents.createdAt],
  });

  return userAgents.map((agent) => ({
    ...agent,
    expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
  }));
}

/**
 * Find agents by project
 * TODO: Implement when projectAgents schema is moved to proper location
 */
export async function findAgentsByProject(projectId: string): Promise<any[]> {
  // const db = getDatabase();

  // const projectAgentsList = await db.query.projectAgents.findMany({
  //   where: and(
  //     eq(projectAgents.projectId, projectId),
  //     eq(projectAgents.isActive, true)
  //   ),
  //   with: {
  //     agent: true,
  //   },
  // });

  // return projectAgentsList.map(pa => ({
  //   ...(pa.agent as any),
  //   expertise: (pa.agent as any).expertise ? JSON.parse((pa.agent as any).expertise) : [],
  //   projectRole: pa.role,
  // }));

  // Temporary implementation
  console.log("findAgentsByProject called with:", projectId);
  return [];
}

/**
 * Add agent to project
 */
export async function addAgentToProject(
  agentId: string,
  projectId: string,
  role: string = "developer",
  addedBy: string,
): Promise<void> {
  const db = getDatabase();

  // Check if agent exists
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  // Check if already in project
  const existing = await db.query.projectAgents.findFirst({
    where: and(
      eq(projectAgents.agentId, agentId),
      eq(projectAgents.projectId, projectId),
    ),
  });

  if (existing && existing.isActive) {
    throw new Error("Agent already in project");
  }

  if (existing) {
    // Reactivate if exists but inactive
    await db
      .update(projectAgents)
      .set({
        isActive: true,
        role,
        addedBy,
        addedAt: new Date(),
        removedAt: null,
      })
      .where(
        and(
          eq(projectAgents.agentId, agentId),
          eq(projectAgents.projectId, projectId),
        ),
      );
  } else {
    // Create new relationship
    await db.insert(projectAgents).values({
      agentId,
      projectId,
      role,
      permissions: JSON.stringify(["read", "write"]),
      isActive: true,
      addedBy,
      addedAt: new Date(),
    });
  }
}

/**
 * Remove agent from project
 */
export async function removeAgentFromProject(
  agentId: string,
  projectId: string,
): Promise<void> {
  const db = getDatabase();

  await db
    .update(projectAgents)
    .set({
      isActive: false,
      removedAt: new Date(),
    })
    .where(
      and(
        eq(projectAgents.agentId, agentId),
        eq(projectAgents.projectId, projectId),
      ),
    );
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  agentId: string,
  status: "online" | "busy" | "offline",
  userId: string,
): Promise<void> {
  const db = getDatabase();

  // Check permissions
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  if (agent.createdBy !== userId) {
    throw new Error("Only agent creator can update status");
  }

  await db
    .update(agents)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}

/**
 * Delete agent (soft delete)
 */
export async function deleteAgent(
  agentId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  // Check permissions
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  if (agent.createdBy !== userId) {
    throw new Error("Only agent creator can delete it");
  }

  // Remove from all projects first
  await db
    .update(projectAgents)
    .set({
      isActive: false,
      removedAt: new Date(),
    })
    .where(eq(projectAgents.agentId, agentId));

  // Soft delete agent
  await db
    .update(agents)
    .set({
      status: "offline",
      isGlobal: false,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));
}

/**
 * Update agent configuration
 */
export async function updateAgent(
  agentId: string,
  input: Partial<CreateAgentInput>,
  userId: string,
): Promise<any> {
  const db = getDatabase();

  // Check permissions
  const agent = await findAgentById(agentId);
  if (!agent) {
    throw new Error("Agent not found");
  }

  if (agent.createdBy !== userId) {
    throw new Error("Only agent creator can update it");
  }

  // Update agent
  const updateData: any = {
    ...input,
    updatedAt: new Date(),
  };

  if (input.expertise) {
    updateData.expertise = JSON.stringify(input.expertise);
  }

  await db.update(agents).set(updateData).where(eq(agents.id, agentId));

  return await findAgentById(agentId);
}

// Helper functions

async function validateAgentLimits(userId: string): Promise<void> {
  const userAgents = await findAgentsByUser(userId);
  const MAX_AGENTS_PER_USER = 10;

  if (userAgents.length >= MAX_AGENTS_PER_USER) {
    throw new Error(`Maximum of ${MAX_AGENTS_PER_USER} agents per user`);
  }
}

function generateDefaultSystemPrompt(agent: CreateAgentInput): string {
  return `You are ${agent.name}, a ${agent.role} AI assistant.

Your expertise includes: ${agent.expertise?.join(", ") || "general software development"}.

Your role is to help with software development tasks including:
- Writing and reviewing code
- Suggesting improvements
- Debugging issues
- Documenting features
- Planning implementations

Always be helpful, professional, and focused on delivering high-quality solutions.`;
}
