import type { InsertAgentMemory } from "@/main/features/agent/memory/memory.model";
import { SimplifiedMemoryService } from "@/main/features/agent/memory/memory.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

/**
 * Setup simplified memory IPC handlers
 */
export function setupAgentMemoryHandlers(): void {
  // Fix mismatch: preload expects 'create' but handler used 'store'
  createIpcHandler("agent-memory:create", (input: InsertAgentMemory) =>
    SimplifiedMemoryService.store(input),
  );

  createIpcHandler(
    "agent-memory:retrieve",
    (agentId: string, limit: number = 50) =>
      SimplifiedMemoryService.retrieve(agentId, limit),
  );

  createIpcHandler("agent-memory:find-by-id", (id: string) =>
    SimplifiedMemoryService.findById(id),
  );

  createIpcHandler(
    "agent-memory:update",
    (id: string, updates: Partial<InsertAgentMemory>) =>
      SimplifiedMemoryService.update(id, updates),
  );

  createIpcHandler("agent-memory:delete", (id: string) =>
    SimplifiedMemoryService.delete(id),
  );
}
