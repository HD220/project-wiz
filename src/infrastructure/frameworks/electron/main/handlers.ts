import { ElectronIpcHandler } from "@/infrastructure/frameworks/electron/electron-ipc.adapter";
import { CreateLLMProviderConfigUseCase } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";
import {
  registerServices,
  registerJobHandlers,
  registerQueryHandlers,
  registerUsecaseHandlers,
} from "./handlers/index";
import {
  processJobUseCase,
  jobRepository,
  userQuery,
  llmProviderQuery,
} from "./handlers/services";

export function registerHandlers(
  ipcHandler: ElectronIpcHandler,
  createLLMProviderConfigUseCase: CreateLLMProviderConfigUseCase,
  createUserUseCase: CreateUserUseCase
) {
  registerServices(ipcHandler);
  registerJobHandlers(ipcHandler, processJobUseCase, jobRepository);
  registerQueryHandlers(ipcHandler, userQuery, llmProviderQuery);
  registerUsecaseHandlers(
    ipcHandler,
    createLLMProviderConfigUseCase,
    createUserUseCase
  );
}
