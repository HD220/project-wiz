import { ipcMain } from "electron";

import type { IpcResponse } from "@/main/types";

import { AgentMemoryService } from "./agent-memory.service";
import { MemoryMaintenanceService } from "./memory-maintenance.service";

import type {
  AgentMemoryWithMetadata,
  MemorySearchCriteria,
  MemoryRelevanceScore,
  InsertAgentMemory,
  UpdateAgentMemory,
} from "./agent-memories.schema";

export function setupAgentMemoryHandlers(): void {
  /**
   * Create a new memory entry
   */
  ipcMain.handle(
    "agent-memory:create",
    async (
      _,
      input: InsertAgentMemory,
    ): Promise<IpcResponse<AgentMemoryWithMetadata>> => {
      try {
        const memory = await AgentMemoryService.create(input);
        return { success: true, data: memory };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create memory",
        };
      }
    },
  );

  /**
   * Find memory by ID
   */
  ipcMain.handle(
    "agent-memory:find-by-id",
    async (
      _,
      id: string,
    ): Promise<IpcResponse<AgentMemoryWithMetadata | null>> => {
      try {
        const memory = await AgentMemoryService.findById(id);
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
   * Search memories with criteria
   */
  ipcMain.handle(
    "agent-memory:search",
    async (
      _,
      criteria: MemorySearchCriteria,
    ): Promise<IpcResponse<MemoryRelevanceScore[]>> => {
      try {
        const memories = await AgentMemoryService.search(criteria);
        return { success: true, data: memories };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to search memories",
        };
      }
    },
  );

  /**
   * Get recent memories for an agent
   */
  ipcMain.handle(
    "agent-memory:get-recent",
    async (
      _,
      agentId: string,
      userId: string,
      limit?: number,
    ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> => {
      try {
        const memories = await AgentMemoryService.getRecent(
          agentId,
          userId,
          limit,
        );
        return { success: true, data: memories };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get recent memories",
        };
      }
    },
  );

  /**
   * Get memories by conversation
   */
  ipcMain.handle(
    "agent-memory:get-by-conversation",
    async (
      _,
      conversationId: string,
      limit?: number,
    ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> => {
      try {
        const memories = await AgentMemoryService.getByConversation(
          conversationId,
          limit,
        );
        return { success: true, data: memories };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get conversation memories",
        };
      }
    },
  );

  /**
   * Update a memory
   */
  ipcMain.handle(
    "agent-memory:update",
    async (
      _,
      id: string,
      updates: Partial<UpdateAgentMemory>,
    ): Promise<IpcResponse<AgentMemoryWithMetadata>> => {
      try {
        const memory = await AgentMemoryService.update(id, updates);
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
   * Archive a memory
   */
  ipcMain.handle(
    "agent-memory:archive",
    async (_, id: string): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.archive(id);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to archive memory",
        };
      }
    },
  );

  /**
   * Delete a memory
   */
  ipcMain.handle(
    "agent-memory:delete",
    async (_, id: string): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.delete(id);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete memory",
        };
      }
    },
  );

  /**
   * Create memory relation
   */
  ipcMain.handle(
    "agent-memory:create-relation",
    async (
      _,
      sourceMemoryId: string,
      targetMemoryId: string,
      relationType: string,
      strength?: number,
    ): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.createRelation(
          sourceMemoryId,
          targetMemoryId,
          relationType,
          strength,
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to create memory relation",
        };
      }
    },
  );

  /**
   * Get related memories
   */
  ipcMain.handle(
    "agent-memory:get-related",
    async (
      _,
      memoryId: string,
    ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> => {
      try {
        const memories = await AgentMemoryService.getRelatedMemories(memoryId);
        return { success: true, data: memories };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get related memories",
        };
      }
    },
  );

  /**
   * Prune old memories
   */
  ipcMain.handle(
    "agent-memory:prune",
    async (
      _,
      agentId: string,
      daysOld?: number,
      minImportanceScore?: number,
    ): Promise<IpcResponse<number>> => {
      try {
        const prunedCount = await AgentMemoryService.pruneOldMemories(
          agentId,
          daysOld,
          minImportanceScore,
        );
        return { success: true, data: prunedCount };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to prune memories",
        };
      }
    },
  );

  /**
   * Perform comprehensive memory maintenance
   */
  ipcMain.handle(
    "agent-memory:clean-old-memories",
    async (_, agentId: string, daysOld?: number): Promise<IpcResponse> => {
      try {
        const result = await MemoryMaintenanceService.cleanOldMemories(
          agentId,
          daysOld,
        );
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to clean old memories",
        };
      }
    },
  );

  /**
   * Get memory statistics
   */
  ipcMain.handle(
    "agent-memory:get-count",
    async (_, agentId: string): Promise<IpcResponse> => {
      try {
        const count = await MemoryMaintenanceService.getMemoryCount(agentId);
        return { success: true, data: { count } };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get memory count",
        };
      }
    },
  );

  /**
   * Run automated maintenance for all agents
   */
}
