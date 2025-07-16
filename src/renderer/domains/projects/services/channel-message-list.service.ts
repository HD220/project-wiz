import type {
  ChannelMessageDto,
  ChannelMessageFilterDto,
  ChannelMessagePaginationDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export async function listChannelMessages(filter?: ChannelMessageFilterDto): Promise<ChannelMessageDto[]> {
  return window.electronIPC.invoke("channelMessage:list", filter);
}

export async function listChannelMessagesByChannel(
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
}

export async function getLatestChannelMessages(channelId: string, limit = 50): Promise<ChannelMessageDto[]> {
  return window.electronIPC.invoke(
    "channelMessage:getLatest",
    channelId,
    limit.toString(),
  );
}

export async function getChannelMessageById(id: string): Promise<ChannelMessageDto | null> {
  return window.electronIPC.invoke("channelMessage:getById", id);
}

export async function getLastChannelMessage(channelId: string): Promise<ChannelMessageDto | null> {
  return window.electronIPC.invoke("channelMessage:getLastMessage", channelId);
}