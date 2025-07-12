import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ChannelMessageService } from "../application/channel-message.service";
import { ChannelMessageMapper } from "../channel-message.mapper";
import type { 
  CreateChannelMessageDto, 
  UpdateChannelMessageDto, 
  ChannelMessageDto, 
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto
} from "../../../../shared/types/channel-message.types";

export class ChannelMessageIpcHandlers {
  constructor(
    private channelMessageService: ChannelMessageService,
    private channelMessageMapper: ChannelMessageMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("channelMessage:create", this.handleCreateMessage.bind(this));
    ipcMain.handle("channelMessage:list", this.handleListMessages.bind(this));
    ipcMain.handle("channelMessage:listByChannel", this.handleListMessagesByChannel.bind(this));
    ipcMain.handle("channelMessage:getLatest", this.handleGetLatestMessages.bind(this));
    ipcMain.handle("channelMessage:getById", this.handleGetMessageById.bind(this));
    ipcMain.handle("channelMessage:update", this.handleUpdateMessage.bind(this));
    ipcMain.handle("channelMessage:delete", this.handleDeleteMessage.bind(this));
    ipcMain.handle("channelMessage:search", this.handleSearchMessages.bind(this));
    ipcMain.handle("channelMessage:getLastMessage", this.handleGetLastMessage.bind(this));
    
    // Métodos de conveniência para tipos específicos
    ipcMain.handle("channelMessage:createText", this.handleCreateTextMessage.bind(this));
    ipcMain.handle("channelMessage:createCode", this.handleCreateCodeMessage.bind(this));
    ipcMain.handle("channelMessage:createSystem", this.handleCreateSystemMessage.bind(this));
    ipcMain.handle("channelMessage:createFile", this.handleCreateFileMessage.bind(this));
  }

  private async handleCreateMessage(
    event: IpcMainInvokeEvent,
    data: CreateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createMessage(data);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(`Failed to create channel message: ${(error as Error).message}`);
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
      throw new Error(`Failed to list channel messages: ${(error as Error).message}`);
    }
  }

  private async handleListMessagesByChannel(
    event: IpcMainInvokeEvent,
    channelId: string,
    limit?: number,
    offset?: number,
  ): Promise<ChannelMessagePaginationDto> {
    try {
      return await this.channelMessageService.listMessagesByChannel(channelId, limit, offset);
    } catch (error) {
      throw new Error(`Failed to list messages by channel: ${(error as Error).message}`);
    }
  }

  private async handleGetLatestMessages(
    event: IpcMainInvokeEvent,
    channelId: string,
    limit?: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const messages = await this.channelMessageService.getLatestMessages(channelId, limit);
      return this.channelMessageMapper.entityToDtoArray(messages);
    } catch (error) {
      throw new Error(`Failed to get latest messages: ${(error as Error).message}`);
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
      throw new Error(`Failed to get channel message: ${(error as Error).message}`);
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
      throw new Error(`Failed to update channel message: ${(error as Error).message}`);
    }
  }

  private async handleDeleteMessage(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.channelMessageService.deleteMessage(id);
    } catch (error) {
      throw new Error(`Failed to delete channel message: ${(error as Error).message}`);
    }
  }

  private async handleSearchMessages(
    event: IpcMainInvokeEvent,
    channelId: string,
    searchTerm: string,
    limit?: number,
  ): Promise<ChannelMessageDto[]> {
    try {
      const messages = await this.channelMessageService.searchMessages(channelId, searchTerm, limit);
      return this.channelMessageMapper.entityToDtoArray(messages);
    } catch (error) {
      throw new Error(`Failed to search channel messages: ${(error as Error).message}`);
    }
  }

  private async handleGetLastMessage(
    event: IpcMainInvokeEvent,
    channelId: string,
  ): Promise<ChannelMessageDto | null> {
    try {
      const message = await this.channelMessageService.getLastMessage(channelId);
      return message ? this.channelMessageMapper.toDto(message) : null;
    } catch (error) {
      throw new Error(`Failed to get last message: ${(error as Error).message}`);
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
      const message = await this.channelMessageService.createTextMessage(content, channelId, authorId, authorName);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(`Failed to create text message: ${(error as Error).message}`);
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
      const message = await this.channelMessageService.createCodeMessage(code, language, channelId, authorId, authorName);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(`Failed to create code message: ${(error as Error).message}`);
    }
  }

  private async handleCreateSystemMessage(
    event: IpcMainInvokeEvent,
    content: string,
    channelId: string,
    metadata?: Record<string, any>,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createSystemMessage(content, channelId, metadata);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(`Failed to create system message: ${(error as Error).message}`);
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
      const message = await this.channelMessageService.createFileMessage(fileName, fileUrl, channelId, authorId, authorName);
      return this.channelMessageMapper.toDto(message);
    } catch (error) {
      throw new Error(`Failed to create file message: ${(error as Error).message}`);
    }
  }
}