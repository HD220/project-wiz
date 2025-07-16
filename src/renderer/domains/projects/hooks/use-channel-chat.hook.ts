import { useTyping } from "./use-typing.hook";
import { useAiChatConfig } from "./use-ai-chat-config.hook";
import { useAiChatUtilities } from "./use-ai-chat-utilities.hook";
import { useChannelChatMessages } from "./use-channel-chat-messages.hook";
import { useChannelChatSend } from "./use-channel-chat-send.hook";
import { useChannelChatResult } from "./use-channel-chat-result.hook";
import { useChannelChatSendMessage } from "./use-channel-chat-send-message.hook";

interface UseChannelChatProps {
  channelId: string;
  llmProviderId?: string;
  authorId: string;
  authorName: string;
  aiName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useChannelChat(props: UseChannelChatProps) {
  const messagesHook = useChannelChatMessages(props.channelId);
  const { isTyping, setTyping } = useTyping(props.channelId);
  const config = useAiChatConfig(props);
  const utilities = useAiChatUtilities(props.channelId, props.llmProviderId);
  const sendHook = useChannelChatSend(
    props,
    messagesHook.addOptimisticMessage,
    messagesHook.clearOptimisticMessages,
  );
  const sendMessage = useChannelChatSendMessage(sendHook, messagesHook, setTyping);

  return useChannelChatResult(
    messagesHook,
    sendHook,
    isTyping,
    setTyping,
    sendMessage,
    config,
    utilities,
  );
}
