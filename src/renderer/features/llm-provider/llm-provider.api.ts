import type {
  LlmProvider,
  CreateProviderInput,
} from "@/main/features/agent/llm-provider/llm-provider.types";
import type { IpcResponse } from "@/main/types";

export class LlmProviderAPI {
  static async create(input: CreateProviderInput): Promise<LlmProvider> {
    const response: IpcResponse<LlmProvider> =
      await window.api.llmProviders.create(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to create provider");
    }

    return response.data!;
  }

  static async update(
    id: string,
    input: Partial<CreateProviderInput>,
  ): Promise<LlmProvider> {
    const response: IpcResponse<LlmProvider> =
      await window.api.llmProviders.update(id, input);

    if (!response.success) {
      throw new Error(response.error || "Failed to update provider");
    }

    return response.data!;
  }

  static async delete(id: string): Promise<void> {
    const response: IpcResponse<void> =
      await window.api.llmProviders.delete(id);

    if (!response.success) {
      throw new Error(response.error || "Failed to delete provider");
    }
  }

  static async list(userId: string): Promise<LlmProvider[]> {
    const response: IpcResponse<LlmProvider[]> =
      await window.api.llmProviders.list(userId);

    if (!response.success) {
      throw new Error(response.error || "Failed to list providers");
    }

    return response.data || [];
  }

  static async testConnection(input: CreateProviderInput): Promise<boolean> {
    const response: IpcResponse<{ success: boolean }> =
      await window.api.llmProviders.test(input);

    if (!response.success) {
      throw new Error(response.error || "Failed to test provider");
    }

    return response.data?.success || false;
  }
}
