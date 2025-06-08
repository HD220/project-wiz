import { describe, it, expect, vi, beforeEach } from "vitest";
import { ok, error } from "@/shared/result";
import type {
  CreateLLMProviderConfigUseCaseInput,
  CreateLLMProviderConfigUseCaseOutput,
} from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { ElectronIpcService } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { CreateLLMProviderConfigUseCase } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";
import { ILLMProviderRepository } from "@/core/ports/repositories/llm-provider.interface";

// Mock do IPCChannels
const mockIpcChannels = {
  CREATE_LLM_PROVIDER_CONFIG: "usecase:create-llm-provider-config",
};

vi.mock("@/core/application/ports/ipc-channels", () => ({
  IpcChannels: mockIpcChannels,
}));

describe("Create Channels - create-llm-provider-config", () => {
  let ipcService: ElectronIpcService;
  let mockCreateLLMProviderConfigUseCase: CreateLLMProviderConfigUseCase;

  beforeEach(() => {
    ipcService = new ElectronIpcService();
    mockCreateLLMProviderConfigUseCase = new CreateLLMProviderConfigUseCase(
      {} as ILLMProviderRepository,
      {} as ILLMProviderConfigRepository
    );
  });

  it("should create LLM provider config successfully", async () => {
    const mockResponse = { llmProviderConfigId: "config-123" };
    vi.mocked(mockCreateLLMProviderConfigUseCase.execute).mockResolvedValue(
      ok(mockResponse)
    );

    const result = await ipcService.invoke<
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput
    >(mockIpcChannels.CREATE_LLM_PROVIDER_CONFIG, {
      name: "Test Config",
      apiKey: "test-api-key",
      llmProviderId: "provider-123",
      modelId: "model-123",
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(mockResponse);
    }
  });

  it("should validate required parameters", async () => {
    const result = await ipcService.invoke<
      Omit<
        CreateLLMProviderConfigUseCaseInput,
        "apiKey" | "llmProviderId" | "modelId"
      > & { apiKey?: string; llmProviderId?: string; modelId?: string },
      CreateLLMProviderConfigUseCaseOutput
    >(mockIpcChannels.CREATE_LLM_PROVIDER_CONFIG, {
      name: "Test Config",
      // Missing apiKey, llmProviderId, modelId
    });

    expect(result.isOk()).toBe(false);
  });

  it("should handle LLM provider not found error", async () => {
    vi.mocked(mockCreateLLMProviderConfigUseCase.execute).mockResolvedValue(
      error("LLM Provider not found")
    );

    const result = await ipcService.invoke<
      CreateLLMProviderConfigUseCaseInput,
      CreateLLMProviderConfigUseCaseOutput
    >(mockIpcChannels.CREATE_LLM_PROVIDER_CONFIG, {
      name: "Test Config",
      apiKey: "test-api-key",
      llmProviderId: "invalid-provider",
      modelId: "model-123",
    });

    expect(result.isOk()).toBe(false);
  });
});
