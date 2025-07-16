import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export const channelMessageService = {
  async list(filter?: ChannelMessageFilterDto): Promise<ChannelMessageDto[]> {
    return window.electronIPC.invoke("channelMessage:list", filter);
  },

  async listByChannel(
    channelId: string,
    limit = 50,
    offset = 0,
  ): Promise<ChannelMessagePaginationDto> {
    return window.electronIPC.invoke(
      "channelMessage:listByChannel",
      channelId,
      limit.toString(),
      offset.toString(),
    );
  },

  async getLatest(channelId: string, limit = 50): Promise<ChannelMessageDto[]> {
    return window.electronIPC.invoke(
      "channelMessage:getLatest",
      channelId,
      limit.toString(),
    );
  },

  async getById(id: string): Promise<ChannelMessageDto | null> {
    return window.electronIPC.invoke("channelMessage:getById", id);
  },

  async create(data: CreateChannelMessageDto): Promise<ChannelMessageDto> {
    return window.electronIPC.invoke("channelMessage:create", data);
  },

  async createText(
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ): Promise<ChannelMessageDto> {
    return window.electronIPC.invoke(
      "channelMessage:createText",
      content,
      channelId,
      authorId,
      authorName,
    );
  },

  async update(data: UpdateChannelMessageDto): Promise<ChannelMessageDto> {
    return window.electronIPC.invoke("channelMessage:update", data);
  },

  async delete(id: string): Promise<void> {
    return window.electronIPC.invoke("channelMessage:delete", id);
  },

  async search(
    channelId: string,
    searchTerm: string,
    limit = 20,
  ): Promise<ChannelMessageDto[]> {
    return window.electronIPC.invoke(
      "channelMessage:search",
      channelId,
      searchTerm,
      limit.toString(),
    );
  },

  async getLastMessage(channelId: string): Promise<ChannelMessageDto | null> {
    return window.electronIPC.invoke(
      "channelMessage:getLastMessage",
      channelId,
    );
  },
};
