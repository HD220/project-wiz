import type { AgentFiltersInput } from "@/main/features/agent/agent.schema";
import { AgentService } from "@/main/features/agent/agent.service";
import type {
  CreateAgentInput,
  AgentStatus,
} from "@/main/features/agent/agent.types";
import { AuthService } from "@/main/features/auth/auth.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

/**
 * Setup agent IPC handlers
 * Exposes AgentService methods to the frontend via IPC
 */
export function setupAgentHandlers(): void {
  // Create agent (with session-based auth)
  createIpcHandler("agents:create", async (input: CreateAgentInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return AgentService.create(input, currentUser.id);
  });

  // Update agent (with session-based auth)
  createIpcHandler(
    "agents:update",
    async (id: string, updates: Partial<CreateAgentInput>) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return AgentService.update(id, updates);
    },
  );

  // Delete agent (with session-based auth)
  createIpcHandler("agents:delete", async (id: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    await AgentService.delete(id);
    return { message: "Agent deleted successfully" };
  });

  // List agents (with session-based auth and filters)
  createIpcHandler("agents:list", async (filters?: AgentFiltersInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return AgentService.listByOwnerIdWithFilters(currentUser.id, filters);
  });

  // Get agent by ID
  createIpcHandler("agents:get", async (id: string) => {
    const result = await AgentService.findById(id);
    if (!result) {
      throw new Error("Agent not found");
    }
    return result;
  });

  // Get agent with provider information
  createIpcHandler("agents:getWithProvider", async (id: string) => {
    const result = await AgentService.getWithProvider(id);
    if (!result) {
      throw new Error("Agent not found");
    }
    return result;
  });

  // Update agent status
  createIpcHandler(
    "agents:updateStatus",
    async (id: string, status: AgentStatus) => {
      await AgentService.updateStatus(id, status);
      return { message: "Agent status updated successfully" };
    },
  );
}
