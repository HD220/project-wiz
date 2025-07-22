import { ipcMain } from "electron";

import { AgentService } from "@/main/features/agent/agent.service";
import type {
  CreateAgentInput,
  AgentStatus,
} from "@/main/features/agent/agent.types";
import { AuthService } from "@/main/features/auth/auth.service";
import { withAuthUserId } from "@/main/middleware/auth.middleware";
import type { IpcResponse } from "@/main/types";

/**
 * Setup agent CRUD operation handlers
 */
function setupAgentCrudHandlers(): void {
  // Create agent
  ipcMain.handle(
    "agents:create",
    withAuthUserId(async (_, userId, input: CreateAgentInput) => {
      return await AgentService.create(input, userId);
    }),
  );

  // Update agent
  ipcMain.handle(
    "agents:update",
    async (
      _,
      id: string,
      updates: Partial<CreateAgentInput>,
    ): Promise<IpcResponse> => {
      try {
        const result = await AgentService.update(id, updates);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update agent",
        };
      }
    },
  );

  // Delete agent
  ipcMain.handle(
    "agents:delete",
    withAuthUserId(async (_, _userId, id: string) => {
      await AgentService.delete(id);
      return { message: "Agent deleted successfully" };
    }),
  );
}

/**
 * Setup agent query operation handlers
 */
function setupAgentQueryHandlers(): void {
  // List agents
  ipcMain.handle("agents:list", async (_, filters?): Promise<IpcResponse> => {
    try {
      // Get session from main process for desktop authentication
      const activeSession = await AuthService.getActiveSession();
      if (!activeSession) {
        throw new Error("User not authenticated");
      }
      const currentUser = activeSession.user;

      const result = await AgentService.listByUserIdWithFilters(
        currentUser.id,
        filters,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list agents",
      };
    }
  });

  // Get agent by ID
  ipcMain.handle("agents:get", async (_, id: string): Promise<IpcResponse> => {
    try {
      const result = await AgentService.findById(id);
      if (!result) {
        throw new Error("Agent not found");
      }
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get agent",
      };
    }
  });

  // Get agent with provider information
  ipcMain.handle(
    "agents:getWithProvider",
    async (_, id: string): Promise<IpcResponse> => {
      try {
        const result = await AgentService.getWithProvider(id);
        if (!result) {
          throw new Error("Agent not found");
        }
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to get agent with provider",
        };
      }
    },
  );
}

/**
 * Setup agent status management handlers
 */
function setupAgentStatusHandlers(): void {
  // Update agent status
  ipcMain.handle(
    "agents:updateStatus",
    async (_, id: string, status: AgentStatus): Promise<IpcResponse> => {
      try {
        await AgentService.updateStatus(id, status);
        return {
          success: true,
          data: { message: "Agent status updated successfully" },
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to update agent status",
        };
      }
    },
  );
}

/**
 * Setup agent IPC handlers
 * Exposes AgentService methods to the frontend via IPC
 */
export function setupAgentHandlers(): void {
  setupAgentCrudHandlers();
  setupAgentQueryHandlers();
  setupAgentStatusHandlers();
}
