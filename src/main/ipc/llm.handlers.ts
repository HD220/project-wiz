import { ipcMain } from "electron";

import {
  createLlmProvider,
  findLlmProviderById,
  findAllLlmProviders,
  updateLlmProvider,
  deleteLlmProvider,
  setDefaultLlmProvider,
  findDefaultLlmProvider,
  llmProviderToDto,
} from "../domains/llm/functions";

export function registerLlmProviderHandlers(): void {
  ipcMain.handle("llm-provider:create", async (_, data) => {
    const provider = await createLlmProvider(data);
    return llmProviderToDto(provider);
  });

  ipcMain.handle("llm-provider:getById", async (_, data) => {
    const provider = await findLlmProviderById(data.id);
    return provider ? llmProviderToDto(provider) : null;
  });

  ipcMain.handle("llm-provider:list", async (_, filter) => {
    const providers = await findAllLlmProviders(filter);
    return providers.map(llmProviderToDto);
  });

  ipcMain.handle("llm-provider:update", async (_, data) => {
    const provider = await updateLlmProvider(data.id, data);
    return llmProviderToDto(provider);
  });

  ipcMain.handle("llm-provider:delete", async (_, data) => {
    await deleteLlmProvider(data.id);
  });

  ipcMain.handle("llm-provider:setDefault", async (_, data) => {
    const provider = await setDefaultLlmProvider(data.id);
    return llmProviderToDto(provider);
  });

  ipcMain.handle("llm-provider:getDefault", async (_) => {
    const provider = await findDefaultLlmProvider();
    return provider ? llmProviderToDto(provider) : null;
  });
}
