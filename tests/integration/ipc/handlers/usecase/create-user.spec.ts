import { describe, it, expect, vi, beforeEach } from "vitest";
import { IpcMainInvokeEvent } from "electron";
import { ok } from "@/shared/result";
import { ElectronIpcService } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";
import { IUserRepository } from "@/core/ports/repositories/user.interface";
import { ILLMProviderConfigRepository } from "@/core/ports/repositories/llm-provider-config.interface";

// Mock do IPCChannels
const mockIpcChannels = {
  CREATE_USER: "usecase:create-user",
};

vi.mock("@/core/application/ports/ipc-channels", () => ({
  IpcChannels: mockIpcChannels,
}));

describe("Create Channels - create-user", () => {
  let ipcService: ElectronIpcService;
  let _mockEvent: IpcMainInvokeEvent;
  let mockCreateUserUseCase: CreateUserUseCase;

  beforeEach(() => {
    ipcService = new ElectronIpcService();
    _mockEvent = {} as IpcMainInvokeEvent;
    mockCreateUserUseCase = new CreateUserUseCase(
      {} as IUserRepository,
      {} as ILLMProviderConfigRepository
    );
  });

  it("should create user successfully", async () => {
    const mockResponse = { userId: "user-123" };
    vi.mocked(mockCreateUserUseCase.execute).mockResolvedValue(
      ok(mockResponse)
    );

    const result = await ipcService.invoke<
      {
        user: {
          nickname: string;
          email: string;
          avatarUrl: string;
        };
        llmProviderConfigId: string;
      },
      { userId: string }
    >(mockIpcChannels.CREATE_USER, {
      user: {
        nickname: "Test User",
        email: "test@example.com",
        avatarUrl: "https://example.com/avatar.png",
      },
      llmProviderConfigId: "config-123",
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(mockResponse);
    }
  });
});
