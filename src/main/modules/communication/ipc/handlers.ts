import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { ChannelService } from "../services/channel.service";
import { ChannelMapper } from "../mappers/channel.mapper";
import type { 
  CreateChannelDto, 
  UpdateChannelDto, 
  ChannelDto, 
  ChannelFilterDto 
} from "../../../../shared/types/channel.types";

export class ChannelIpcHandlers {
  constructor(
    private channelService: ChannelService,
    private channelMapper: ChannelMapper,
  ) {}

  registerHandlers(): void {
    ipcMain.handle("channel:create", this.handleCreateChannel.bind(this));
    ipcMain.handle("channel:list", this.handleListChannels.bind(this));
    ipcMain.handle("channel:getById", this.handleGetChannelById.bind(this));
    ipcMain.handle("channel:update", this.handleUpdateChannel.bind(this));
    ipcMain.handle("channel:archive", this.handleArchiveChannel.bind(this));
    ipcMain.handle("channel:delete", this.handleDeleteChannel.bind(this));
  }

  private async handleCreateChannel(
    event: IpcMainInvokeEvent,
    data: CreateChannelDto,
  ): Promise<ChannelDto> {
    try {
      const channel = await this.channelService.createChannel(data);
      return this.channelMapper.toDtoFromData(channel);
    } catch (error) {
      throw new Error(`Failed to create channel: ${(error as Error).message}`);
    }
  }

  private async handleListChannels(
    event: IpcMainInvokeEvent,
    filter?: ChannelFilterDto,
  ): Promise<ChannelDto[]> {
    try {
      const channels = await this.channelService.listChannels(filter);
      return channels.map(channel => this.channelMapper.toDtoFromData(channel));
    } catch (error) {
      throw new Error(`Failed to list channels: ${(error as Error).message}`);
    }
  }

  private async handleGetChannelById(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<ChannelDto | null> {
    try {
      const channel = await this.channelService.getChannelById({ id });
      return channel ? this.channelMapper.toDtoFromData(channel) : null;
    } catch (error) {
      throw new Error(`Failed to get channel: ${(error as Error).message}`);
    }
  }

  private async handleUpdateChannel(
    event: IpcMainInvokeEvent,
    data: UpdateChannelDto,
  ): Promise<ChannelDto> {
    try {
      const channel = await this.channelService.updateChannel(data);
      return this.channelMapper.toDtoFromData(channel);
    } catch (error) {
      throw new Error(`Failed to update channel: ${(error as Error).message}`);
    }
  }

  private async handleArchiveChannel(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<ChannelDto> {
    try {
      const channel = await this.channelService.archiveChannel({ id });
      return this.channelMapper.toDtoFromData(channel);
    } catch (error) {
      throw new Error(`Failed to archive channel: ${(error as Error).message}`);
    }
  }

  private async handleDeleteChannel(
    event: IpcMainInvokeEvent,
    id: string,
  ): Promise<void> {
    try {
      await this.channelService.deleteChannel({ id });
    } catch (error) {
      throw new Error(`Failed to delete channel: ${(error as Error).message}`);
    }
  }
}