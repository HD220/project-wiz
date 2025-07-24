import { LlmProviderService } from "@/main/features/agent/llm-provider/llm-provider.service";
import type { CreateProviderInput } from "@/main/features/agent/llm-provider/llm-provider.types";
import { AuthService } from "@/main/features/auth/auth.service";
import { createIpcHandler } from "@/main/utils/ipc-handler";

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

  // List LLM providers (use session instead of userId parameter)
  createIpcHandler("llm-providers:list", async () => {
    const currentUser = await AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }
    return LlmProviderService.findByUserId(currentUser.id);
  });

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
