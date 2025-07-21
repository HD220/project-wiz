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

/**
 * Setup memory CRUD operation handlers
 */
function setupMemoryCrudHandlers(): void {
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
   * Update memory
   */
  ipcMain.handle(
    "agent-memory:update",
    async (
      _,
      id: string,
      updates: UpdateAgentMemory,
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
   * Archive memory
   */
  ipcMain.handle(
    "agent-memory:archive",
    async (_, id: string): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.archive(id);
        return { success: true, data: undefined };
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
   * Delete memory
   */
  ipcMain.handle(
    "agent-memory:delete",
    async (_, id: string): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.delete(id);
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

/**
 * Setup memory retrieval and search operation handlers
 */
function setupMemoryRetrievalHandlers(): void {
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
        const results = await AgentMemoryService.search(criteria);
        return { success: true, data: results };
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
      limit: number = 10,
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
   * Get memories by conversation ID
   */
  ipcMain.handle(
    "agent-memory:get-by-conversation",
    async (
      _,
      conversationId: string,
    ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> => {
      try {
        const memories =
          await AgentMemoryService.getByConversationId(conversationId);
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
   * Get related memories
   */
  ipcMain.handle(
    "agent-memory:get-related",
    async (
      _,
      memoryId: string,
      limit: number = 5,
    ): Promise<IpcResponse<MemoryRelevanceScore[]>> => {
      try {
        const memories = await AgentMemoryService.getRelated(memoryId, limit);
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
}

/**
 * Setup memory relationship operation handlers
 */
function setupMemoryRelationHandlers(): void {
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
      strength: number = 1.0,
    ): Promise<IpcResponse<void>> => {
      try {
        await AgentMemoryService.createRelation(
          sourceMemoryId,
          targetMemoryId,
          relationType,
          strength,
        );
        return { success: true, data: undefined };
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
}

/**
 * Setup memory maintenance and analytics operation handlers
 */
function setupMemoryMaintenanceHandlers(): void {
  /**
   * Prune old memories for an agent
   */
  ipcMain.handle(
    "agent-memory:prune",
    async (
      _,
      agentId: string,
      retentionDays: number = 30,
    ): Promise<IpcResponse<{ deletedCount: number }>> => {
      try {
        const result = await MemoryMaintenanceService.pruneOldMemories(
          agentId,
          retentionDays,
        );
        return { success: true, data: result };
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
   * Clean old memories across all agents
   */
  ipcMain.handle(
    "agent-memory:clean-old-memories",
    async (
      _,
      retentionDays: number = 90,
    ): Promise<IpcResponse<{ deletedCount: number }>> => {
      try {
        const result =
          await MemoryMaintenanceService.cleanOldMemories(retentionDays);
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
   * Get memory count statistics
   */
  ipcMain.handle(
    "agent-memory:get-count",
    async (
      _,
      agentId: string,
    ): Promise<
      IpcResponse<{ total: number; active: number; archived: number }>
    > => {
      try {
        const result = await AgentMemoryService.getMemoryCount(agentId);
        return { success: true, data: result };
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
}

/**
 * Setup agent memory IPC handlers
 */
export function setupAgentMemoryHandlers(): void {
  setupMemoryCrudHandlers();
  setupMemoryRetrievalHandlers();
  setupMemoryRelationHandlers();
  setupMemoryMaintenanceHandlers();
}
