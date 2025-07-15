import { useChannelChat } from './use-channel-chat.hook';

export function useSimpleChannelChat(
  channelId: string,
  llmProviderId: string,
  authorId: string,
  authorName: string,
  systemPrompt?: string
) {
  return useChannelChat({
    channelId,
    llmProviderId,
    authorId,
    authorName,
    systemPrompt,
    temperature: 0.7,
    maxTokens: 1000,
    includeHistory: true,
    historyLimit: 10,
  });
}