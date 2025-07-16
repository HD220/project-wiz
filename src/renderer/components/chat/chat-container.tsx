import { useChannelMessagesById } from "@/features/channel-messaging/hooks/use-channel-messages.hook";
import { Message } from "@/lib/placeholders";
import { cn } from "@/lib/utils";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

import type { ChannelMessageDto } from "@/shared/types";

interface ChatContainerProps {
  channelId?: string;
  channelName?: string;
  agentId?: string;
  agentName?: string;
  className?: string;
}

export function ChatContainer({
  channelId,
  channelName,
  agentId,
  agentName,
  className,
}: ChatContainerProps) {
  const channelMessagesHook = channelId ? useChannelMessagesById(channelId) : null;
  const agentMessages: Message[] = [];
  
  const messages = channelId ? channelMessagesHook?.messages || [] : agentMessages;
  const displayName = channelName || agentName || "Chat";
  const isAgentChat = !!agentId;
  const isLoading = channelMessagesHook?.isLoading || false;
  const error = channelMessagesHook?.error;

  const handleSendMessage = async (messageText: string) => {
    if (channelId && channelMessagesHook) {
      await channelMessagesHook.sendTextMessage(
        messageText,
        "current-user-id", // TODO: Get from user context
        "João Silva", // TODO: Get from user context
      );
    } else if (agentId) {
      console.log("Sending message to agent:", messageText);
    }
  };

  const handleEditMessage = (id: string, content: string) => {
    if (channelMessagesHook) {
      channelMessagesHook.updateMessage({ id, content });
    }
  };

  const handleDeleteMessage = (id: string) => {
    if (channelMessagesHook) {
      channelMessagesHook.deleteMessage(id);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      <ChatHeader displayName={displayName} isAgentChat={isAgentChat} />
      
      <ChatMessages
        messages={messages}
        displayName={displayName}
        isAgentChat={isAgentChat}
        isLoading={isLoading}
        error={error}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onRetry={() => channelMessagesHook?.refetch()}
      />
      
      <ChatInput
        displayName={displayName}
        isAgentChat={isAgentChat}
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}