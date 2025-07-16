import type {
  LlmProviderDto,
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types/domains/llm/llm-provider.types";

export const llmProviderService = {
  async list(filter?: LlmProviderFilterDto): Promise<LlmProviderDto[]> {
    return window.electronIPC.invoke("llm:provider:list", filter);
  },

  async getById(id: string): Promise<LlmProviderDto | null> {
    return window.electronIPC.invoke("llm:provider:getById", { id });
  },

  async create(data: CreateLlmProviderDto): Promise<LlmProviderDto> {
    return window.electronIPC.invoke("llm:provider:create", data);
  },

  async update(data: UpdateLlmProviderDto): Promise<LlmProviderDto> {
    return window.electronIPC.invoke("llm:provider:update", data);
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.invoke("llm:provider:delete", { id });
  },

  async setDefault(id: string): Promise<void> {
    return window.electronIPC.invoke("llm:provider:setDefault", { id });
  },

  async getDefault(): Promise<LlmProviderDto | null> {
    return window.electronIPC.invoke("llm:provider:getDefault");
  },
};
