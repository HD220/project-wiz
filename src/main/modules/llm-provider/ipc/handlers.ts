import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { LlmProviderService } from "../application/llm-provider.service";
import { AIService } from "../application/ai-service";
import { LlmProviderMapper } from "../llm-provider.mapper";
import type {
  CreateLlmProviderDto,
  UpdateLlmProviderDto,
  LlmProviderDto,
  LlmProviderFilterDto,
} from "../../../../shared/types/llm-provider.types";
import type { CoreMessage } from "ai";

export class LlmProviderIpcHandlers {
  private aiService: AIService;

  constructor(
    private llmProviderService: LlmProviderService,
    private llmProviderMapper: LlmProviderMapper,
  ) {
    this.aiService = new AIService(llmProviderService);
  }

  registerHandlers(): void {
    ipcMain.handle(
      "llm-provider:create",
      this.handleCreateLlmProvider.bind(this),
    );
    ipcMain.handle("llm-provider:list", this.handleListLlmProviders.bind(this));
    ipcMain.handle(
      "llm-provider:getById",
      this.handleGetLlmProviderById.bind(this),
    );
    ipcMain.handle(
      "llm-provider:update",
      this.handleUpdateLlmProvider.bind(this),
    );
    ipcMain.handle(
      "llm-provider:delete",
      this.handleDeleteLlmProvider.bind(this),
    );

    // AI Service handlers
    ipcMain.handle("ai:generate-text", this.handleGenerateText.bind(this));
    ipcMain.handle(
      "ai:validate-provider",
      this.handleValidateProvider.bind(this),
    );
    
    // Default provider handlers
    ipcMain.handle(
      "llm-provider:getDefault",
      this.handleGetDefaultProvider.bind(this),
    );
    ipcMain.handle(
      "llm-provider:setDefault",
      this.handleSetDefaultProvider.bind(this),
    );
  }

  private async handleCreateLlmProvider(
    event: IpcMainInvokeEvent,
    data: CreateLlmProviderDto,
  ): Promise<LlmProviderDto> {
    try {
      const llmProvider = await this.llmProviderService.createLlmProvider(data);
      return this.llmProviderMapper.toDto(llmProvider);
    } catch (error) {
      throw new Error(
        `Failed to create LLM provider: ${(error as Error).message}`,
      );
    }
  }

  private async handleListLlmProviders(
    event: IpcMainInvokeEvent,
    filter?: LlmProviderFilterDto,
  ): Promise<LlmProviderDto[]> {
    try {
      const llmProviders =
        await this.llmProviderService.listLlmProviders(filter);
      return llmProviders.map((llmProvider) =>
        this.llmProviderMapper.toDto(llmProvider),
      );
    } catch (error) {
      throw new Error(
        `Failed to list LLM providers: ${(error as Error).message}`,
      );
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
      throw new Error(
        `Failed to get LLM provider: ${(error as Error).message}`,
      );
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
      throw new Error(
        `Failed to update LLM provider: ${(error as Error).message}`,
      );
    }
  }

  private async handleDeleteLlmProvider(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.llmProviderService.deleteLlmProvider(id);
    } catch (error) {
      throw new Error(
        `Failed to delete LLM provider: ${(error as Error).message}`,
      );
    }
  }

  private async handleGenerateText(
    event: IpcMainInvokeEvent,
    data: {
      providerId: string;
      messages: CoreMessage[];
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<string> {
    try {
      const response = await this.aiService.generateResponse(
        {
          providerId: data.providerId,
          systemPrompt: data.systemPrompt,
        },
        {
          messages: data.messages,
          temperature: data.temperature,
          maxTokens: data.maxTokens,
        },
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to generate text: ${(error as Error).message}`);
    }
  }

  private async handleValidateProvider(
    event: IpcMainInvokeEvent,
    providerId: string,
  ): Promise<boolean> {
    try {
      return await this.aiService.validateProvider(providerId);
    } catch (error) {
      console.error(`Failed to validate provider ${providerId}:`, error);
      return false;
    }
  }

  private async handleGetDefaultProvider(
    event: IpcMainInvokeEvent,
  ): Promise<LlmProviderDto | null> {
    try {
      const defaultProvider = await this.llmProviderService.getDefaultProvider();
      return defaultProvider ? this.llmProviderMapper.toDto(defaultProvider) : null;
    } catch (error) {
      throw new Error(
        `Failed to get default provider: ${(error as Error).message}`,
      );
    }
  }

  private async handleSetDefaultProvider(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<LlmProviderDto> {
    try {
      const defaultProvider = await this.llmProviderService.setDefaultProvider(id);
      return this.llmProviderMapper.toDto(defaultProvider);
    } catch (error) {
      throw new Error(
        `Failed to set default provider: ${(error as Error).message}`,
      );
    }
  }
}
