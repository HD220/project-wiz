import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ChannelMessageService } from "../services/channel-message.service";
import { ChannelMessageMapper } from "../mappers/channel-message.mapper";
import type {
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageDto,
  ChannelMessageFilterDto
} from "../../../../shared/types/channel-message.types";

export class ChannelMessageIpcHandlers {
  constructor(
    private channelMessageService: ChannelMessageService,
    private channelMessageMapper: ChannelMessageMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("channelMessage:create", this.handleCreateMessage.bind(this));
    ipcMain.handle("channelMessage:list", this.handleListMessages.bind(this));
    ipcMain.handle("channelMessage:getById", this.handleGetMessageById.bind(this));
    ipcMain.handle("channelMessage:update", this.handleUpdateMessage.bind(this));
    ipcMain.handle("channelMessage:delete", this.handleDeleteMessage.bind(this));
  }

  private async handleCreateMessage(
    event: IpcMainInvokeEvent,
    data: CreateChannelMessageDto,
  ): Promise<ChannelMessageDto> {
    try {
      const message = await this.channelMessageService.createMessage(data);
      return this.channelMessageMapper.toDtoFromData(message);
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
      return messages.map(message => this.channelMessageMapper.toDtoFromData(message));
    } catch (error) {
      throw new Error(`Failed to list channel messages: ${(error as Error).message}`);
    }
  }

  private async handleGetMessageById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<ChannelMessageDto | null> {
    try {
      const message = await this.channelMessageService.getMessageById({ id });
      return message ? this.channelMessageMapper.toDtoFromData(message) : null;
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
      return this.channelMessageMapper.toDtoFromData(message);
    } catch (error) {
      throw new Error(`Failed to update channel message: ${(error as Error).message}`);
    }
  }

  private async handleDeleteMessage(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.channelMessageService.deleteMessage({ id });
    } catch (error) {
      throw new Error(`Failed to delete channel message: ${(error as Error).message}`);
    }
  }
}