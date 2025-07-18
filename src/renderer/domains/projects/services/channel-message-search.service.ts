import type { ChannelMessageDto } from "../../../../shared/types/domains/projects/channel-message.types";

export async function searchChannelMessages(
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
}
