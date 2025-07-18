import { ipcMain } from "electron";
import {
  createLlmProvider,
  findLlmProviderById,
  findLlmProvidersByUser,
  updateLlmProvider,
  deleteLlmProvider,
  setDefaultLlmProvider,
  findDefaultLlmProvider,
} from "./llm.service";

export function registerLlmProviderHandlers(): void {
  ipcMain.handle("llm-provider:create", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await createLlmProvider(data, userId);
  });

  ipcMain.handle("llm-provider:getById", async (_, data) => {
    return await findLlmProviderById(data.id);
  });

  ipcMain.handle("llm-provider:list", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await findLlmProvidersByUser(userId);
  });

  ipcMain.handle("llm-provider:update", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await updateLlmProvider(data.id, data, userId);
  });

  ipcMain.handle("llm-provider:delete", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    await deleteLlmProvider(data.id, userId);
  });

  ipcMain.handle("llm-provider:setDefault", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await setDefaultLlmProvider(data.id, userId);
  });

  ipcMain.handle("llm-provider:getDefault", async (_, data) => {
    const userId = data.userId || "temp-user-id";
    return await findDefaultLlmProvider(userId);
  });
}
