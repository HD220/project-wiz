import { ScrollArea } from "../../../../components/ui/scroll-area";
import { MessageItem } from "../../../../components/chat/message-item";
import { useAgentChat } from "../hooks/use-agent-chat.hook";
import { useConversationAutoScroll } from "../hooks/use-conversation-auto-scroll.hook";
import { useConversationMessageHandler } from "../hooks/use-conversation-message-handler.hook";
import { ConversationHeader } from "./conversation-header";
import { ConversationErrorDisplay } from "./conversation-error-display";
import { ConversationEmptyState } from "./conversation-empty-state";
import { ConversationTypingIndicator } from "./conversation-typing-indicator";
import { ConversationMissingAgentWarning } from "./conversation-missing-agent-warning";
import { ConversationMessageInput } from "./conversation-message-input";
import type {
  ConversationDto,
  MessageDto,
} from "../../../../shared/types/domains/users/user.types";

interface ConversationViewProps {
  conversationId: string;
  conversation: ConversationDto;
}

export function ConversationView({
  conversationId,
  conversation,
}: ConversationViewProps) {
  const {
    messages,
    isSending,
    isTyping,
    error,
    sendMessage,
    regenerateLastMessage,
    clearError,
    agent,
    fullAgent,
  } = useAgentChat({ conversationId, conversation });

  const { messagesEndRef } = useConversationAutoScroll(
    messages,
    isTyping,
    conversationId,
  );
  const messageHandler = useConversationMessageHandler(sendMessage, fullAgent);

  const convertToMessageFormat = (msg: MessageDto) => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    senderName: msg.senderId === "user" ? "João Silva" : agent.name,
    senderType: msg.senderType,
    messageType: "text" as const,
    timestamp: new Date(msg.timestamp || msg.createdAt),
    isEdited: false,
    mentions: [],
  });

  return (
    <div className="flex flex-col h-full bg-background">
      <ConversationHeader agentName={agent.name} />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {error && (
              <ConversationErrorDisplay
                error={error}
                onClearError={clearError}
              />
            )}
            {!fullAgent && <ConversationMissingAgentWarning />}

            {messages.length === 0 ? (
              <ConversationEmptyState agentName={agent.name} />
            ) : (
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
                {isTyping && (
                  <ConversationTypingIndicator agentName={agent.name} />
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <ConversationMessageInput
        messageInput={messageHandler.messageInput}
        setMessageInput={messageHandler.setMessageInput}
        onSend={messageHandler.handleSend}
        onKeyDown={messageHandler.handleKeyDown}
        isDisabled={!fullAgent}
        agentName={agent.name}
      />
    </div>
  );
}
