import { ipcMain } from "electron";

import type {
  InsertAgentMemory,
  SelectAgentMemory,
} from "@/main/features/agent/memory/memory.model";
import { SimplifiedMemoryService } from "@/main/features/agent/memory/memory.service";
import type { IpcResponse } from "@/main/types";

/**
 * Setup simplified memory IPC handlers
 */
export function setupAgentMemoryHandlers(): void {
  /**
   * Store a new memory entry
   */
  ipcMain.handle(
    "agent-memory:store",
    async (
      _,
      input: InsertAgentMemory,
    ): Promise<IpcResponse<SelectAgentMemory>> => {
      try {
        const memory = await SimplifiedMemoryService.store(input);
        return { success: true, data: memory };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to store memory",
        };
      }
    },
  );

  /**
   * Retrieve memories for an agent
   */
  ipcMain.handle(
    "agent-memory:retrieve",
    async (
      _,
      agentId: string,
      limit: number = 50,
    ): Promise<IpcResponse<SelectAgentMemory[]>> => {
      try {
        const memories = await SimplifiedMemoryService.retrieve(agentId, limit);
        return { success: true, data: memories };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to retrieve memories",
        };
      }
    },
  );

  /**
   * Find memory by ID
   */
  ipcMain.handle(
    "agent-memory:find-by-id",
    async (_, id: string): Promise<IpcResponse<SelectAgentMemory | null>> => {
      try {
        const memory = await SimplifiedMemoryService.findById(id);
        return { success: true, data: memory };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to find memory",
        };
      }
    },
  );

  /**
   * Update memory
   */
  ipcMain.handle(
    "agent-memory:update",
    async (
      _,
      id: string,
      updates: Partial<InsertAgentMemory>,
    ): Promise<IpcResponse<SelectAgentMemory>> => {
      try {
        const memory = await SimplifiedMemoryService.update(id, updates);
        return { success: true, data: memory };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update memory",
        };
      }
    },
  );

  /**
   * Delete memory
   */
  ipcMain.handle(
    "agent-memory:delete",
    async (_, id: string): Promise<IpcResponse<void>> => {
      try {
        await SimplifiedMemoryService.delete(id);
        return { success: true, data: undefined };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete memory",
        };
      }
    },
  );
}
