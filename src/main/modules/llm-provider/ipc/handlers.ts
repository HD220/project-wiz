import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { LlmProviderService } from "../application/llm-provider.service";
import { LlmProviderMapper } from "../llm-provider.mapper";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderDto,
  LlmProviderFilterDto
} from "../../../shared/types/llm-provider.types";

export class LlmProviderIpcHandlers {
  constructor(
    private llmProviderService: LlmProviderService,
    private llmProviderMapper: LlmProviderMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("llm-provider:create", this.handleCreateLlmProvider.bind(this));
    ipcMain.handle("llm-provider:list", this.handleListLlmProviders.bind(this));
    ipcMain.handle("llm-provider:getById", this.handleGetLlmProviderById.bind(this));
    ipcMain.handle("llm-provider:update", this.handleUpdateLlmProvider.bind(this));
    ipcMain.handle("llm-provider:delete", this.handleDeleteLlmProvider.bind(this));
  }

  private async handleCreateLlmProvider(
    event: IpcMainInvokeEvent,
    data: CreateLlmProviderDto,
  ): Promise<LlmProviderDto> {
    try {
      const llmProvider = await this.llmProviderService.createLlmProvider(data);
      return this.llmProviderMapper.toDto(llmProvider);
    } catch (error) {
      throw new Error(`Failed to create LLM provider: ${(error as Error).message}`);
    }
  }

  private async handleListLlmProviders(
    event: IpcMainInvokeEvent,
    filter?: LlmProviderFilterDto,
  ): Promise<LlmProviderDto[]> {
    try {
      const llmProviders = await this.llmProviderService.listLlmProviders(filter);
      return llmProviders.map(llmProvider => this.llmProviderMapper.toDto(llmProvider));
    } catch (error) {
      throw new Error(`Failed to list LLM providers: ${(error as Error).message}`);
    }
  }

  private async handleGetLlmProviderById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<LlmProviderDto | null> {
    try {
      const llmProvider = await this.llmProviderService.getLlmProviderById(id);
      return llmProvider ? this.llmProviderMapper.toDto(llmProvider) : null;
    } catch (error) {
      throw new Error(`Failed to get LLM provider: ${(error as Error).message}`);
    }
  }

  private async handleUpdateLlmProvider(
    event: IpcMainInvokeEvent,
    data: UpdateLlmProviderDto,
  ): Promise<LlmProviderDto> {
    try {
      const llmProvider = await this.llmProviderService.updateLlmProvider(data);
      return this.llmProviderMapper.toDto(llmProvider);
    } catch (error) {
      throw new Error(`Failed to update LLM provider: ${(error as Error).message}`);
    }
  }

  private async handleDeleteLlmProvider(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.llmProviderService.deleteLlmProvider(id);
    } catch (error) {
      throw new Error(`Failed to delete LLM provider: ${(error as Error).message}`);
    }
  }
}
