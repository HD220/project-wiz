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
import { requireUserId } from "../../utils/auth-utils";

export function registerLlmProviderHandlers(): void {
  ipcMain.handle("llm-provider:create", async (_, data) => {
    const userId = requireUserId(data);
    return await createLlmProvider(data, userId);
  });

  ipcMain.handle("llm-provider:getById", async (_, data) => {
    return await findLlmProviderById(data.id);
  });

  ipcMain.handle("llm-provider:list", async (_, data) => {
    const userId = requireUserId(data);
    return await findLlmProvidersByUser(userId);
  });

  ipcMain.handle("llm-provider:update", async (_, data) => {
    const userId = requireUserId(data);
    return await updateLlmProvider(data.id, data, userId);
  });

  ipcMain.handle("llm-provider:delete", async (_, data) => {
    const userId = requireUserId(data);
    await deleteLlmProvider(data.id, userId);
  });

  ipcMain.handle("llm-provider:setDefault", async (_, data) => {
    const userId = requireUserId(data);
    return await setDefaultLlmProvider(data.id, userId);
  });

  ipcMain.handle("llm-provider:getDefault", async (_, data) => {
    const userId = requireUserId(data);
    return await findDefaultLlmProvider(userId);
  });
}
