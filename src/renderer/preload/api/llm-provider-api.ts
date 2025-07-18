import { ipcRenderer } from "electron";

import type {
  CreateLlmProviderDto,
  LlmProviderDto,
  LlmProviderFilterDto,
  UpdateLlmProviderDto,
} from "../../../shared/types/llm/llm-provider.types";

export interface ILlmProviderAPI {
  create: (data: CreateLlmProviderDto) => Promise<LlmProviderDto>;
  getById: (id: string) => Promise<LlmProviderDto | null>;
  list: (filter?: LlmProviderFilterDto) => Promise<LlmProviderDto[]>;
  update: (id: string, data: UpdateLlmProviderDto) => Promise<LlmProviderDto>;
  delete: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<LlmProviderDto>;
  getDefault: () => Promise<LlmProviderDto | null>;
}

export function createLlmProviderAPI(): ILlmProviderAPI {
  return {
    create: createLlmProvider,
    getById: getLlmProviderById,
    list: listLlmProviders,
    update: updateLlmProvider,
    delete: deleteLlmProvider,
    setDefault: setDefaultLlmProvider,
    getDefault: getDefaultLlmProvider,
  };
}

function createLlmProvider(
  data: CreateLlmProviderDto,
): Promise<LlmProviderDto> {
  return ipcRenderer.invoke("llm-provider:create", data);
}

function getLlmProviderById(id: string): Promise<LlmProviderDto | null> {
  return ipcRenderer.invoke("llm-provider:getById", { id });
}

function listLlmProviders(
  filter?: LlmProviderFilterDto,
): Promise<LlmProviderDto[]> {
  return ipcRenderer.invoke("llm-provider:list", filter);
}

function updateLlmProvider(
  id: string,
  data: UpdateLlmProviderDto,
): Promise<LlmProviderDto> {
  return ipcRenderer.invoke("llm-provider:update", { ...data, id });
}

function deleteLlmProvider(id: string): Promise<void> {
  return ipcRenderer.invoke("llm-provider:delete", { id });
}

function setDefaultLlmProvider(id: string): Promise<LlmProviderDto> {
  return ipcRenderer.invoke("llm-provider:setDefault", { id });
}

function getDefaultLlmProvider(): Promise<LlmProviderDto | null> {
  return ipcRenderer.invoke("llm-provider:getDefault");
}
