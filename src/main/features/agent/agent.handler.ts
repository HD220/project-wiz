import type { AgentFiltersInput } from "@/main/features/agent/agent.schema";
import { AgentService } from "@/main/features/agent/agent.service";
import type {
  CreateAgentInput,
  AgentStatus,
} from "@/main/features/agent/agent.types";
import { AuthService } from "@/main/features/auth/auth.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";
import { getLogger } from "@/main/utils/logger";

/**
 * Setup agent IPC handlers
 * Exposes AgentService methods to the frontend via IPC
 */
export function setupAgentHandlers(): void {
  const log = getLogger("agent.handler");

  // Create agent (with session-based auth)
  createIpcHandler("agents:create", async (input: CreateAgentInput) => {
    log.info({ agentName: input.name }, "IPC: agents:create called");
    
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const result = await AgentService.create(input, currentUser.id);
    log.info({ agentId: result.id, agentName: result.name }, "IPC: agents:create completed successfully");
    return result;
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

  // Soft delete agent (with session-based auth)
  createIpcHandler("agents:delete", async (id: string) => {
    log.info({ agentId: id }, "IPC: agents:delete called");
    
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    
    const result = await AgentService.softDelete(id, currentUser.id);
    log.info({ agentId: id, success: result }, "IPC: agents:delete completed successfully");
    return { message: "Agent deactivated successfully" };
  });

  // Restore agent (with session-based auth)
  createIpcHandler("agents:restore", async (id: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const restored = await AgentService.restore(id);
    return { message: "Agent restored successfully", agent: restored };
  });

  // List agents (with session-based auth and filters)
  createIpcHandler("agents:list", async (filters?: AgentFiltersInput) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Map frontend showInactive to backend includeInactive
    const serviceFilters = filters
      ? {
          ...filters,
          includeInactive: filters.showInactive || false,
        }
      : undefined;

    return AgentService.listByOwnerId(currentUser.id, serviceFilters);
  });

  // Get agent by ID
  createIpcHandler(
    "agents:get",
    async (id: string, includeInactive?: boolean) => {
      const result = await AgentService.findById(id, includeInactive);
      if (!result) {
        throw new Error("Agent not found or inactive");
      }
      return result;
    },
  );

  // Get agent with provider information
  createIpcHandler("agents:getWithProvider", async (id: string) => {
    const result = await AgentService.getWithProvider(id);
    if (!result) {
      throw new Error("Agent not found or inactive");
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

  // Get active agents count for user
  createIpcHandler("agents:getActiveCount", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const count = await AgentService.getActiveAgentsCount(currentUser.id);
    return { count };
  });

  // Get active agents for conversation
  createIpcHandler(
    "agents:getActiveForConversation",
    async (conversationId: string) => {
      return AgentService.getActiveAgentsForConversation(conversationId);
    },
  );

  // DEPRECATED: Hard delete (for backward compatibility)
  createIpcHandler("agents:hardDelete", async (id: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    const log = getLogger("agent.handler");
    log.warn(
      "agents:hardDelete is deprecated. Use agents:delete (soft delete) instead.",
      { agentId: id },
    );
    await AgentService.delete(id);
    return { message: "Agent permanently deleted" };
  });
}
