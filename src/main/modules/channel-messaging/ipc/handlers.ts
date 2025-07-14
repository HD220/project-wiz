import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ChannelMessageService } from "../application/channel-message.service";
import { AIChatService } from "../application/ai-chat.service";
import { ChannelMessageMapper } from "../channel-message.mapper";
import type {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto,
} from "../../../../shared/types/channel-message.types";

export class ChannelMessageIpcHandlers {
  constructor(
    private channelMessageService: ChannelMessageService,
    private channelMessageMapper: ChannelMessageMapper,
    private aiChatService?: AIChatService,
  ) {}

  registerHandlers(): void {
    ipcMain.handle(
      "channelMessage:create",
      this.handleCreateMessage.bind(this),
    );
    ipcMain.handle("channelMessage:list", this.handleListMessages.bind(this));
    ipcMain.handle(
      "channelMessage:listByChannel",
      this.handleListMessagesByChannel.bind(this),
    );
    ipcMain.handle(
      "channelMessage:getLatest",
      this.handleGetLatestMessages.bind(this),
    );
    ipcMain.handle(
      "channelMessage:getById",
      this.handleGetMessageById.bind(this),
    );
    ipcMain.handle(
      "channelMessage:update",
      this.handleUpdateMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:delete",
      this.handleDeleteMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:search",
      this.handleSearchMessages.bind(this),
    );
    ipcMain.handle(
      "channelMessage:getLastMessage",
      this.handleGetLastMessage.bind(this),
    );

    // Métodos de conveniência para tipos específicos
    ipcMain.handle(
      "channelMessage:createText",
      this.handleCreateTextMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:createCode",
      this.handleCreateCodeMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:createSystem",
      this.handleCreateSystemMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:createFile",
      this.handleCreateFileMessage.bind(this),
    );

    // AI Chat integration handlers
    ipcMain.handle(
      "channelMessage:ai:sendMessage",
      this.handleAISendMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:ai:regenerateMessage",
      this.handleAIRegenerateMessage.bind(this),
    );
    ipcMain.handle(
      "channelMessage:ai:validateProvider",
      this.handleAIValidateProvider.bind(this),
    );
    ipcMain.handle(
      "channelMessage:ai:getConversationSummary",
      this.handleAIGetConversationSummary.bind(this),
    );
    ipcMain.handle(
      "channelMessage:ai:clearMessages",
      this.handleAIClearMessages.bind(this),
    );
  }

  private async handleCreateMessage(
    event: IpcMainInvokeEvent,
    data: CreateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createMessage(data);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to create channel message: ${(error as Error).message}`,
      );
    }
  }

  private async handleListMessages(
    event: IpcMainInvokeEvent,
    filter?: ChannelMessageFilterDto,
  ): Promise<ChannelMessageDto[]> {
    try {
      const messages = await this.channelMessageService.listMessages(filter);
      return this.channelMessageMapper.entityToDtoArray(messages);
    } catch (error) {
      throw new Error(
        `Failed to list channel messages: ${(error as Error).message}`,
      );
    }
  }

  private async handleListMessagesByChannel(
    event: IpcMainInvokeEvent,
    channelId: string,
    limit?: number,
    offset?: number,
  ): Promise<ChannelMessagePaginationDto> {
    try {
      return await this.channelMessageService.listMessagesByChannel(
        channelId,
        limit,
        offset,
      );
    } catch (error) {
      throw new Error(
        `Failed to list messages by channel: ${(error as Error).message}`,
      );
    }
  }

  private async handleGetLatestMessages(
    event: IpcMainInvokeEvent,
    channelId: string,
    limit?: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const messages = await this.channelMessageService.getLatestMessages(
        channelId,
        limit,
      );
      return this.channelMessageMapper.entityToDtoArray(messages);
    } catch (error) {
      throw new Error(
        `Failed to get latest messages: ${(error as Error).message}`,
      );
    }
  }

  private async handleGetMessageById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<ChannelMessageDto | null> {
    try {
      const message = await this.channelMessageService.getMessageById(id);
      return message ? this.channelMessageMapper.toDto(message) : null;
    } catch (error) {
      throw new Error(
        `Failed to get channel message: ${(error as Error).message}`,
      );
    }
  }

  private async handleUpdateMessage(
    event: IpcMainInvokeEvent,
    data: UpdateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.updateMessage(data);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to update channel message: ${(error as Error).message}`,
      );
    }
  }

  private async handleDeleteMessage(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.channelMessageService.deleteMessage(id);
    } catch (error) {
      throw new Error(
        `Failed to delete channel message: ${(error as Error).message}`,
      );
    }
  }

  private async handleSearchMessages(
    event: IpcMainInvokeEvent,
    channelId: string,
    searchTerm: string,
    limit?: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const messages = await this.channelMessageService.searchMessages(
        channelId,
        searchTerm,
        limit,
      );
      return this.channelMessageMapper.entityToDtoArray(messages);
    } catch (error) {
      throw new Error(
        `Failed to search channel messages: ${(error as Error).message}`,
      );
    }
  }

  private async handleGetLastMessage(
    event: IpcMainInvokeEvent,
    channelId: string,
  ): Promise<ChannelMessageDto | null> {
    try {
      const message =
        await this.channelMessageService.getLastMessage(channelId);
      return message ? this.channelMessageMapper.toDto(message) : null;
    } catch (error) {
      throw new Error(
        `Failed to get last message: ${(error as Error).message}`,
      );
    }
  }

  // Handlers para métodos de conveniência
  private async handleCreateTextMessage(
    event: IpcMainInvokeEvent,
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createTextMessage(
        content,
        channelId,
        authorId,
        authorName,
      );
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to create text message: ${(error as Error).message}`,
      );
    }
  }

  private async handleCreateCodeMessage(
    event: IpcMainInvokeEvent,
    code: string,
    language: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createCodeMessage(
        code,
        language,
        channelId,
        authorId,
        authorName,
      );
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to create code message: ${(error as Error).message}`,
      );
    }
  }

  private async handleCreateSystemMessage(
    event: IpcMainInvokeEvent,
    content: string,
    channelId: string,
    metadata?: Record<string, any>,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createSystemMessage(
        content,
        channelId,
        metadata,
      );
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to create system message: ${(error as Error).message}`,
      );
    }
  }

  private async handleCreateFileMessage(
    event: IpcMainInvokeEvent,
    fileName: string,
    fileUrl: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createFileMessage(
        fileName,
        fileUrl,
        channelId,
        authorId,
        authorName,
      );
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(
        `Failed to create file message: ${(error as Error).message}`,
      );
    }
  }

  // AI Chat Integration Handlers
  private async handleAISendMessage(
    event: IpcMainInvokeEvent,
    data: {
      content: string;
      channelId: string;
      llmProviderId: string;
      authorId: string;
      authorName: string;
      aiName?: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
      includeHistory?: boolean;
      historyLimit?: number;
    },
  ): Promise<{ userMessage: ChannelMessageDto; aiMessage: ChannelMessageDto }> {
    try {
      if (!this.aiChatService) {
        throw new Error("AI Chat service não está disponível");
      }

      const result = await this.aiChatService.sendUserMessage(
        data.content,
        {
          channelId: data.channelId,
          llmProviderId: data.llmProviderId,
          authorId: data.authorId,
          authorName: data.authorName,
          systemPrompt: data.systemPrompt,
        },
        {
          temperature: data.temperature,
          maxTokens: data.maxTokens,
          includeHistory: data.includeHistory,
          historyLimit: data.historyLimit,
          aiName: data.aiName,
        },
      );

      return {
        userMessage: this.channelMessageMapper.toDto(result.userMessage),
        aiMessage: this.channelMessageMapper.toDto(result.aiMessage),
      };
    } catch (error) {
      throw new Error(`Failed to send AI message: ${(error as Error).message}`);
    }
  }

  private async handleAIRegenerateMessage(
    event: IpcMainInvokeEvent,
    data: {
      channelId: string;
      llmProviderId: string;
      authorId: string;
      authorName: string;
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<ChannelMessageDto> {
    try {
      if (!this.aiChatService) {
        throw new Error("AI Chat service não está disponível");
      }

      const regeneratedMessage =
        await this.aiChatService.regenerateLastAIMessage(
          {
            channelId: data.channelId,
            llmProviderId: data.llmProviderId,
            authorId: data.authorId,
            authorName: data.authorName,
            systemPrompt: data.systemPrompt,
          },
          {
            temperature: data.temperature,
            maxTokens: data.maxTokens,
          },
        );

      return this.channelMessageMapper.toDto(regeneratedMessage);
    } catch (error) {
      throw new Error(
        `Failed to regenerate AI message: ${(error as Error).message}`,
      );
    }
  }

  private async handleAIValidateProvider(
    event: IpcMainInvokeEvent,
    llmProviderId: string,
  ): Promise<boolean> {
    try {
      if (!this.aiChatService) {
        return false;
      }

      return await this.aiChatService.validateAIProvider(llmProviderId);
    } catch (error) {
      console.error(`Failed to validate AI provider ${llmProviderId}:`, error);
      return false;
    }
  }

  private async handleAIGetConversationSummary(
    event: IpcMainInvokeEvent,
    channelId: string,
    messageLimit?: string,
  ): Promise<string> {
    try {
      if (!this.aiChatService) {
        throw new Error("AI Chat service não está disponível");
      }

      return await this.aiChatService.getConversationSummary(
        channelId,
        messageLimit ? parseInt(messageLimit) : undefined,
      );
    } catch (error) {
      throw new Error(
        `Failed to get conversation summary: ${(error as Error).message}`,
      );
    }
  }

  private async handleAIClearMessages(
    event: IpcMainInvokeEvent,
    channelId: string,
  ): Promise<number> {
    try {
      if (!this.aiChatService) {
        throw new Error("AI Chat service não está disponível");
      }

      return await this.aiChatService.clearAIMessages(channelId);
    } catch (error) {
      throw new Error(
        `Failed to clear AI messages: ${(error as Error).message}`,
      );
    }
  }
}
