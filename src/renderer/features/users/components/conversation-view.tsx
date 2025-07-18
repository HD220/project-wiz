import { useConversationViewState } from "../hooks/use-conversation-view-state.hook";

import { ConversationContent } from "./conversation-content";
import { ConversationHeader } from "./conversation-header";
import { ConversationMessageInput } from "./conversation-message-input";

import type { ConversationDto } from "../../../../shared/types/users/user.types";

interface ConversationViewProps {
  conversationId: string;
  conversation: ConversationDto;
}

export function ConversationView({
  conversationId,
  conversation,
}: ConversationViewProps) {
  const state = useConversationViewState({ conversationId, conversation });

  return (
    <div className="flex flex-col h-full bg-background">
      <ConversationHeader agentName={state.agent.name} />
      <ConversationContent
        messages={state.messages}
        agentName={state.agent.name}
        isTyping={state.isTyping}
        error={state.error}
        fullAgent={state.fullAgent}
        messagesEndRef={state.messagesEndRef}
        convertToMessageFormat={state.convertToMessageFormat}
        onClearError={state.clearError}
      />
      <ConversationMessageInput
        messageInput={state.messageHandler.messageInput}
        setMessageInput={state.messageHandler.setMessageInput}
        onSend={state.messageHandler.handleSend}
        onKeyDown={state.messageHandler.handleKeyDown}
        isDisabled={!state.fullAgent}
        agentName={state.agent.name}
      />
    </div>
  );
}
