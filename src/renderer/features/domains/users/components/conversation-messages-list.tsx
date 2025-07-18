import { ConversationEmptyState } from "./conversation-empty-state";
import { ConversationTypingIndicator } from "./conversation-typing-indicator";

import type { MessageDto } from "../../../../shared/types/users/message-dto.type";
import type { FormattedMessage } from "../../../components/chat/message-item-types";

import { MessageItem } from "@/components/chat/message-item";

interface ConversationMessagesListProps {
  messages: MessageDto[];
  agentName: string;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  convertToMessageFormat: (msg: MessageDto) => FormattedMessage;
}

export function ConversationMessagesList({
  messages,
  agentName,
  isTyping,
  messagesEndRef,
  convertToMessageFormat,
}: ConversationMessagesListProps) {
  if (messages.length === 0) {
    return <ConversationEmptyState agentName={agentName} />;
  }

  return (
    <>
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={convertToMessageFormat(msg)}
          onEdit={(id, content) => console.log("Edit:", id, content)}
          onDelete={(id) => console.log("Delete:", id)}
          onReply={(id) => console.log("Reply:", id)}
          showActions={true}
        />
      ))}
      {isTyping && <ConversationTypingIndicator agentName={agentName} />}
      <div ref={messagesEndRef} />
    </>
  );
}
