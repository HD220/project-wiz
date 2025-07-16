import { useChannelMessagesById } from "@/domains/projects/hooks";
import { cn } from "@/lib/utils";

import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";

interface ChatContainerProps {
  channelId?: string;
  channelName?: string;
  agentId?: string;
  agentName?: string;
  className?: string;
}

export function ChatContainer(props: ChatContainerProps) {
  const { channelId, channelName, agentId, agentName, className } = props;

  const channelMessagesHook = useChannelMessagesById(channelId || "");

  const messages = channelId ? channelMessagesHook.messages || [] : [];
  const displayName = channelName || agentName || "Chat";
  const isAgentChat = !!agentId;
  const isLoading = channelId ? channelMessagesHook.isLoading || false : false;
  const error = channelId ? channelMessagesHook.error : undefined;

  const handleSendMessage = async (messageText: string) => {
    if (channelId) {
      await channelMessagesHook.sendTextMessage(
        messageText,
        "current-user-id",
        "João Silva",
      );
      return;
    }

    if (agentId) {
      console.log("Sending message to agent:", messageText);
    }
  };

  const handleEditMessage = (id: string, content: string) => {
    if (!channelId) {
      return;
    }
    channelMessagesHook.updateMessage({ id, content });
  };

  const handleDeleteMessage = (id: string) => {
    if (!channelId) {
      return;
    }
    channelMessagesHook.deleteMessage(id);
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
