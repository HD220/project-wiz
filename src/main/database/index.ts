export { db, getDatabase } from "./connection";
export type { DatabaseType } from "./connection";

export { usersTable } from "@/main/user/users.schema";
export { llmProvidersTable } from "@/main/agents/llm-providers/llm-providers.schema";
export { agentsTable } from "@/main/agents/agents.schema";
export {
  agentMemoriesTable,
  memoryRelationsTable,
} from "@/main/agents/memory/agent-memories.schema";
