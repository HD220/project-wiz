import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/lib/placeholders";

import { MessageItem } from "./message-item";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatErrorState } from "./chat-error-state";
import { ChatLoadingState } from "./chat-loading-state";

import type { ChannelMessageDto } from "@/shared/types";

interface ChatMessagesProps {
  messages: (ChannelMessageDto | Message)[];
  displayName: string;
  isAgentChat: boolean;
  isLoading: boolean;
  error?: string | null;
  onEditMessage?: (id: string, content: string) => void;
  onDeleteMessage?: (id: string) => void;
  onRetry?: () => void;
}

export function ChatMessages({
  messages,
  displayName,
  isAgentChat,
  isLoading,
  error,
  onEditMessage,
  onDeleteMessage,
  onRetry,
}: ChatMessagesProps) {
  const renderMessageContent = () => {
    if (isLoading && messages.length === 0) {
      return <ChatLoadingState />;
    }

    if (error) {
      return <ChatErrorState error={error} onRetry={onRetry} />;
    }

    if (messages.length === 0) {
      return <ChatEmptyState displayName={displayName} isAgentChat={isAgentChat} />;
    }

    return renderMessages();
  };

  const renderMessages = () => {
    return messages.map((msg) => {
      const isChannelMessage = "channelId" in msg;

      if (isChannelMessage) {
        return renderChannelMessage(msg as ChannelMessageDto);
      }

      return renderLegacyMessage(msg as Message);
    });
  };

  const renderChannelMessage = (channelMsg: ChannelMessageDto) => {
    return (
      <MessageItem
        key={channelMsg.id}
        message={{
          id: channelMsg.id,
          content: channelMsg.content,
          senderId: channelMsg.authorId,
          senderName: channelMsg.authorName,
          senderType: getSenderType(channelMsg.authorId),
          messageType: channelMsg.type === "code" ? "code" : "text",
          timestamp: channelMsg.createdAt,
          isEdited: channelMsg.isEdited,
          mentions: [],
        }}
        onEdit={onEditMessage || (() => {})}
        onDelete={onDeleteMessage || (() => {})}
        onReply={(id) => console.log("Reply:", id)}
        showActions={true}
      />
    );
  };

  const renderLegacyMessage = (legacyMsg: Message) => {
    return (
      <MessageItem
        key={legacyMsg.id}
        message={{
          id: legacyMsg.id,
          content: legacyMsg.content,
          senderId: legacyMsg.authorId,
          senderName: legacyMsg.authorName,
          senderType: legacyMsg.authorId.startsWith("agent-") ? "agent" : "user",
          messageType: legacyMsg.type === "code" ? "text" : (legacyMsg.type as any),
          timestamp: legacyMsg.timestamp,
          isEdited: legacyMsg.edited || false,
          mentions: legacyMsg.mentions || [],
        }}
        onEdit={(id, content) => console.log("Edit:", id, content)}
        onDelete={(id) => console.log("Delete:", id)}
        onReply={(id) => console.log("Reply:", id)}
        showActions={true}
      />
    );
  };

  const getSenderType = (authorId: string) => {
    if (authorId === "system") return "system";
    if (authorId.startsWith("agent-")) return "agent";
    return "user";
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="space-y-4 py-4">{renderMessageContent()}</div>
      </ScrollArea>
    </div>
  );
}