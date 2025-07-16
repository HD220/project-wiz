import type {
  AISendMessageRequestDto,
  AISendMessageResponseDto,
  AIRegenerateMessageRequestDto,
  ChannelMessageDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

export const aiChatService = {
  async sendMessage(
    data: AISendMessageRequestDto,
  ): Promise<AISendMessageResponseDto> {
    return window.electronIPC.invoke("channelMessage:ai:sendMessage", data);
  },

  async regenerateMessage(
    data: AIRegenerateMessageRequestDto,
  ): Promise<ChannelMessageDto> {
    return window.electronIPC.invoke(
      "channelMessage:ai:regenerateMessage",
      data,
    );
  },

  async validateProvider(providerId: string): Promise<boolean> {
    return window.electronIPC.invoke(
      "channelMessage:ai:validateProvider",
      providerId,
    );
  },

  async getConversationSummary(
    channelId: string,
    messageLimit?: number,
  ): Promise<string> {
    return window.electronIPC.invoke(
      "channelMessage:ai:getConversationSummary",
      channelId,
      messageLimit?.toString(),
    );
  },

  async clearMessages(channelId: string): Promise<number> {
    return window.electronIPC.invoke(
      "channelMessage:ai:clearMessages",
      channelId,
    );
  },
};
