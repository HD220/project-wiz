import { ipcMain } from "electron";

import { LlmProviderService } from "@/main/agents/llm-providers/llm-provider.service";
import type { CreateProviderInput } from "@/main/agents/llm-providers/llm-provider.types";
import type { IpcResponse } from "@/main/types";

/**
 * Setup LLM provider IPC handlers
 * Exposes LlmProviderService methods to the frontend via IPC
 */
export function setupLlmProviderHandlers(): void {
  // Create LLM provider
  ipcMain.handle(
    "llm-providers:create",
    async (_, input: CreateProviderInput): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.create(input);
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
              : "Failed to create provider",
        };
      }
    },
  );

  // List LLM providers for a user
  ipcMain.handle(
    "llm-providers:list",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.findByUserId(userId);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to list providers",
        };
      }
    },
  );

  // Get LLM provider by ID
  ipcMain.handle(
    "llm-providers:getById",
    async (_, id: string): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.findById(id);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to get provider",
        };
      }
    },
  );

  // Update LLM provider
  ipcMain.handle(
    "llm-providers:update",
    async (
      _,
      id: string,
      updates: Partial<CreateProviderInput>,
    ): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.update(id, updates);
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
              : "Failed to update provider",
        };
      }
    },
  );

  // Delete LLM provider
  ipcMain.handle(
    "llm-providers:delete",
    async (_, id: string): Promise<IpcResponse> => {
      try {
        await LlmProviderService.delete(id);
        return {
          success: true,
          data: { message: "Provider deleted successfully" },
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to delete provider",
        };
      }
    },
  );

  // Set provider as default
  ipcMain.handle(
    "llm-providers:setDefault",
    async (_, providerId: string, userId: string): Promise<IpcResponse> => {
      try {
        await LlmProviderService.setAsDefault(providerId, userId);
        return {
          success: true,
          data: { message: "Provider set as default" },
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to set provider as default",
        };
      }
    },
  );

  // Get default provider for user
  ipcMain.handle(
    "llm-providers:getDefault",
    async (_, userId: string): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.getDefaultProvider(userId);
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
              : "Failed to get default provider",
        };
      }
    },
  );

  // Test API key
  ipcMain.handle(
    "llm-providers:testApiKey",
    async (
      _,
      type: "openai" | "deepseek" | "anthropic",
      apiKey: string,
      baseUrl?: string,
    ): Promise<IpcResponse> => {
      try {
        const result = await LlmProviderService.testApiKey(
          type,
          apiKey,
          baseUrl,
        );
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to test API key",
        };
      }
    },
  );
}
