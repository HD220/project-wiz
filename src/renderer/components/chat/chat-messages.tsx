import { ScrollArea } from "@/components/ui/scroll-area";

import type { ChannelMessageDto } from "@/shared/types";
import type { MessageType } from "@/shared/types/message.types";

import { ChatEmptyState } from "./chat-empty-state";
import { ChatErrorState } from "./chat-error-state";
import { ChatLoadingState } from "./chat-loading-state";
import { MessageItem } from "./message-item";

interface ChatMessagesProps {
  messages: ChannelMessageDto[];
  displayName: string;
  isAgentChat: boolean;
  isLoading: boolean;
  error?: string | null;
  onEditMessage?: (id: string, content: string) => void;
  onDeleteMessage?: (id: string) => void;
  onRetry?: () => void;
}

function getSenderType(authorId: string) {
  if (authorId === "system") return "system";
  if (authorId.startsWith("agent-")) return "agent";
  return "user";
}

function renderChannelMessage(
  channelMsg: ChannelMessageDto,
  onEditMessage?: (id: string, content: string) => void,
  onDeleteMessage?: (id: string) => void,
) {
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
}

export function ChatMessages(props: ChatMessagesProps) {
  const {
    messages,
    displayName,
    isAgentChat,
    isLoading,
    error,
    onEditMessage,
    onDeleteMessage,
    onRetry,
  } = props;

  const renderMessageContent = () => {
    if (isLoading && messages.length === 0) {
      return <ChatLoadingState />;
    }

    if (error) {
      return <ChatErrorState error={error} onRetry={onRetry} />;
    }

    if (messages.length === 0) {
      return (
        <ChatEmptyState displayName={displayName} isAgentChat={isAgentChat} />
      );
    }

    return renderMessages();
  };

  const renderMessages = () => {
    return messages.map((msg) => {
      return renderChannelMessage(msg, onEditMessage, onDeleteMessage);
    });
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="space-y-4 py-4">{renderMessageContent()}</div>
      </ScrollArea>
    </div>
  );
}
