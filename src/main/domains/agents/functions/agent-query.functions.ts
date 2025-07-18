import { eq } from "drizzle-orm";

import { getDatabase } from "@/infrastructure/database";
import { agents } from "@/main/persistence/schemas";

import { createAgentFromData, AgentWithData } from "./agent-factory.functions";

import type { AgentFilterDto } from "@/shared/types";

export async function findAgentById(id: string): Promise<AgentWithData | null> {
  const db = getDatabase();
  const [agent] = await db.select().from(agents).where(eq(agents.id, id));
  return agent ? createAgentFromData(agent) : null;
}

export async function findAgentByName(
  name: string,
): Promise<AgentWithData | null> {
  const db = getDatabase();
  const [agent] = await db.select().from(agents).where(eq(agents.name, name));
  return agent ? createAgentFromData(agent) : null;
}

export async function findAllAgents(
  filter?: AgentFilterDto,
): Promise<AgentWithData[]> {
  const db = getDatabase();
  const query = db.select().from(agents);

  if (filter?.isActive !== undefined) {
    query.where(eq(agents.isActive, filter.isActive));
  }

  const results = await query;
  return results.map(createAgentFromData);
}

export async function findDefaultAgent(): Promise<AgentWithData | null> {
  const db = getDatabase();
  const [agent] = await db
    .select()
    .from(agents)
    .where(eq(agents.isDefault, true));
  return agent ? createAgentFromData(agent) : null;
}
