import type {
  ChannelMessageDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
} from "../../../../shared/types/projects/channel-message.types";

export async function createChannelMessage(
  data: CreateChannelMessageDto,
): Promise<ChannelMessageDto> {
  return window.electronIPC.invoke("channelMessage:create", data);
}

export async function createTextChannelMessage(
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
}

export async function updateChannelMessage(
  data: UpdateChannelMessageDto,
): Promise<ChannelMessageDto> {
  return window.electronIPC.invoke("channelMessage:update", data);
}

export async function deleteChannelMessage(id: string): Promise<void> {
  return window.electronIPC.invoke("channelMessage:delete", id);
}
