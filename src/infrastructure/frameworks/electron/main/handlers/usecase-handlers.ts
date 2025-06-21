import { ok, error } from "@/shared/result";
import type { IpcChannels } from "@/core/application/ports/ipc-channels";
import { ElectronIpcHandler } from "../../electron-ipc.adapter";
import { CreateLLMProviderConfigUseCase } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";

export function registerUsecaseHandlers(
  ipcHandler: ElectronIpcHandler,
  createLLMProviderConfigUseCase: CreateLLMProviderConfigUseCase,
  createUserUseCase: CreateUserUseCase
) {
  ipcHandler.handle<
    IpcChannels["usecase:create-llm-provider-config"]["request"],
    IpcChannels["usecase:create-llm-provider-config"]["response"]
  >("usecase:create-llm-provider-config", async (data) => {
    try {
      const result = await createLLMProviderConfigUseCase.execute(data);
      return ok(result);
    } catch (_err) {
      // Renomeado para _err
      return error("Failed to create LLM provider config");
    }
  });

  ipcHandler.handle<
    IpcChannels["usecase:create-user"]["request"],
    IpcChannels["usecase:create-user"]["response"]
  >("usecase:create-user", async (data) => {
    try {
      const result = await createUserUseCase.execute(data);
      return ok(result);
    } catch (_err) {
      // Renomeado para _err
      return error("Failed to create user");
    }
  });
}
