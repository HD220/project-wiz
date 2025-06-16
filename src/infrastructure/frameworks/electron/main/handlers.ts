import { ipcMain } from "electron";
import { db } from "@/infrastructure/services/drizzle";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/user-drizzle.repository";
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";
import { LLMProviderRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-drizzle.repository";
import { LLMProviderQuery } from "@/core/application/queries/llm-provider.query";
import { CreateLLMProviderConfigUseCase } from "@/core/application/use-cases/llm-provider/create-llm-provider-config.usecase";
import { LLMProviderConfigRepositoryDrizzle } from "@/infrastructure/repositories/llm-provider-config-drizzle.repository";
import { UserQuery } from "@/core/application/queries/user.query";

// const personaRepository = new PersonaRepositoryDrizzle(db);
const llmProviderRepository = new LLMProviderRepositoryDrizzle(db);
const llmProviderConfigRepository = new LLMProviderConfigRepositoryDrizzle(db);
const userRepository = new UserRepositoryDrizzle(db);

// REGISTER IPC HANDLERS
ipcMain.handle("query:get-user", async (e) => {
  const query = new UserQuery(userRepository);
  return await query.execute();
});
ipcMain.handle("query:persona", async (e, data) => {
  // const query = new PersonaQuery(personaRepository);
  // const result = await query.execute(data);
  // return result;
});
ipcMain.handle("query:agent", async (e, data) => {});
ipcMain.handle("query:llm-provider", async (e, data) => {
  const query = new LLMProviderQuery(llmProviderRepository);
  return await query.execute();
});
ipcMain.handle("query:llm-provider-config", async (e, data) => {});
ipcMain.handle("usecase:create-llm-provider-config", async (e, data) => {
  const usecase = new CreateLLMProviderConfigUseCase(
    llmProviderRepository,
    llmProviderConfigRepository
  );
  return await usecase.execute(data);
});
ipcMain.handle("usecase:create-user", async (e, data) => {
  const usecase = new CreateUserUseCase(
    userRepository,
    llmProviderConfigRepository
  );

  return await usecase.execute(data);
});
