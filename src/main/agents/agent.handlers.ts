import { ipcMain } from "electron";

import { AgentService } from "@/main/agents/agent.service";
import type { CreateAgentInput, AgentStatus } from "@/main/agents/agent.types";
import type { IpcResponse } from "@/main/types";
import { AuthService } from "@/main/user/authentication/auth.service";

/**
 * Setup agent IPC handlers
 * Exposes AgentService methods to the frontend via IPC
 */
export function setupAgentHandlers(): void {
  // Create agent
  ipcMain.handle(
    "agents:create",
    async (_, input: CreateAgentInput): Promise<IpcResponse> => {
      try {
        // Get current user ID for ownership tracking
        const currentUser = await AuthService.getCurrentUser();
        if (!currentUser) {
          throw new Error("User not authenticated");
        }

        const result = await AgentService.create(input, currentUser.id);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create agent",
        };
      }
    },
  );

  // List agents (for now returns all agents, could be filtered by owner)
  ipcMain.handle("agents:list", async (): Promise<IpcResponse> => {
    try {
      // For now, we'll return all agents
      // In a real implementation, you'd want to filter by current user
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const result = await AgentService.findByOwner(currentUser.id);
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
        const result = await AgentService.findWithProvider(id);
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
    async (_, id: string): Promise<IpcResponse> => {
      try {
        await AgentService.delete(id);
        return {
          success: true,
          data: { message: "Agent deleted successfully" },
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete agent",
        };
      }
    },
  );
}
