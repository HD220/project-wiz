import { ScrollArea } from '@/ui/scroll-area'

import { ConversationErrorDisplay } from "./conversation-error-display";
import { ConversationMessagesList } from "./conversation-messages-list";
import { ConversationMissingAgentWarning } from "./conversation-missing-agent-warning";

import type { MessageDto } from "../../../../shared/types/domains/users/user.types";

interface ConversationContentProps {
  messages: MessageDto[];
  agentName: string;
  isTyping: boolean;
  error: string | null;
  fullAgent: any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  convertToMessageFormat: (msg: MessageDto) => any;
  onClearError: () => void;
}

export function ConversationContent({
  messages,
  agentName,
  isTyping,
  error,
  fullAgent,
  messagesEndRef,
  convertToMessageFormat,
  onClearError,
}: ConversationContentProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full px-4">
        <div className="space-y-4 py-4">
          {error && (
            <ConversationErrorDisplay
              error={error}
              onClearError={onClearError}
            />
          )}
          {!fullAgent && <ConversationMissingAgentWarning />}
          <ConversationMessagesList
            messages={messages}
            agentName={agentName}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            convertToMessageFormat={convertToMessageFormat}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
