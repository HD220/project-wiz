import { AuthService } from "@/main/features/auth/auth.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

import { LlmProviderService } from "./llm-provider.service";

import type { CreateProviderInput, ProviderType } from "./llm-provider.types";

// Filter interface for provider listing
interface ProviderFilters {
  type?: ProviderType;
  search?: string;
  showInactive?: boolean;
}

/**
 * Setup LLM provider IPC handlers
 */
export function setupLlmProviderHandlers(): void {
  // Create LLM provider (with session-based auth)
  createIpcHandler(
    "llm-providers:create",
    async (input: CreateProviderInput) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return LlmProviderService.create(input);
    },
  );

  // List LLM providers with filters (use session instead of userId parameter)
  createIpcHandler(
    "llm-providers:list",
    async (filters: ProviderFilters = {}) => {
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      return LlmProviderService.findByUserId(currentUser.id, filters);
    },
  );

  // Get LLM provider by ID
  createIpcHandler("llm-providers:getById", (id: string) =>
    LlmProviderService.findById(id),
  );

  // Update LLM provider
  createIpcHandler(
    "llm-providers:update",
    (id: string, updates: Partial<CreateProviderInput>) =>
      LlmProviderService.update(id, updates),
  );

  // Delete LLM provider
  createIpcHandler("llm-providers:delete", async (id: string) => {
    await LlmProviderService.delete(id);
    return { message: "Provider deleted successfully" };
  });

  // Set provider as default (use session instead of userId parameter)
  createIpcHandler("llm-providers:setDefault", async (providerId: string) => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    await LlmProviderService.setAsDefault(providerId, currentUser.id);
    return { message: "Provider set as default" };
  });

  // Get default provider (use session instead of userId parameter)
  createIpcHandler("llm-providers:getDefault", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return LlmProviderService.getDefaultProvider(currentUser.id);
  });
}
