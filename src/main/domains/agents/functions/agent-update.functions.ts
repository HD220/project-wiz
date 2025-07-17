import { eq } from "drizzle-orm";

import { CrudOperations } from "../../../infrastructure/crud-operations";
import { agents } from "../../../persistence/schemas/agents.schema";

import { createAgentFromData, AgentWithData } from "./agent-factory.functions";

const agentCrud = new CrudOperations(agents, "agents.update");

export async function updateAgent(
  id: string,
  data: {
    name?: string;
    role?: string;
    goal?: string;
    backstory?: string;
    llmProviderId?: string;
    temperature?: number;
    maxTokens?: number;
    isActive?: boolean;
  },
): Promise<AgentWithData> {
  const updated = await agentCrud.updateRecord(id, data);
  return createAgentFromData(updated);
}

export async function deleteAgent(id: string): Promise<void> {
  await agentCrud.deleteRecord(id);
}

export async function activateAgent(id: string): Promise<void> {
  await agentCrud.toggleField(id, "isActive", true);
}

export async function deactivateAgent(id: string): Promise<void> {
  await agentCrud.toggleField(id, "isActive", false);
}

export async function setDefaultAgent(id: string): Promise<void> {
  // Remove default de todos os outros agentes
  await agentCrud.bulkUpdate(eq(agents.isDefault, true), { isDefault: false });

  // Define o novo agent como default
  await agentCrud.toggleField(id, "isDefault", true);
}
