import { ipcMain } from "electron";
import { db } from "@/infrastructure/services/drizzle";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/UserRepositoryDrizzle";
import { CreateUserUseCase } from "@/core/application/use-cases/user/create-user.usecase";
import { PersonaQuery } from "@/core/application/queries/persona.query";
import { PersonaRepositoryDrizzle } from "@/infrastructure/repositories/PersonaRepositoryDrizzle";
import { LLMProviderRepositoryDrizzle } from "@/infrastructure/repositories/LLMProviderRepositoryDrizzle";
import { LLMProviderQuery } from "@/core/application/queries/llm-provider.query";

// REGISTER IPC HANDLERS
ipcMain.handle("query:user", async (e, data) => {});
ipcMain.handle("query:persona", async (e, data) => {
  const personaRepository = new PersonaRepositoryDrizzle(db);
  const query = new PersonaQuery(personaRepository);
  const result = await query.execute(data);
  return result;
});
ipcMain.handle("query:agent", async (e, data) => {});
ipcMain.handle("query:llm-provider", async (e, data) => {
  const llmProviderRepository = new LLMProviderRepositoryDrizzle(db);
  const query = new LLMProviderQuery(llmProviderRepository);
  const result = await query.execute();
  return result;
});
ipcMain.handle("query:llm-provider-config", async (e, data) => {});

ipcMain.handle("user-create", (e, data) => {
  // const userRepository = new UserRepositoryDrizzle(db);
  // const usecase = new CreateUserUseCase(userRepository);

  // usecase.execute(data);

  console.log(data, "data");
});
