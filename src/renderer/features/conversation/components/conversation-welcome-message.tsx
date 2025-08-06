import { MessageCircle } from "lucide-react";
import { Button } from "@/renderer/components/atoms/button";
import { Icon } from "@/renderer/components/atoms/icon";
import { Text } from "@/renderer/components/atoms/text";

interface ConversationWelcomeMessageProps {
  displayName: string;
  isArchived: boolean;
}

export function ConversationWelcomeMessage({
  displayName,
  isArchived,
}: ConversationWelcomeMessageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium mb-2">
          Welcome to {displayName}!
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isArchived
            ? "This conversation has been archived and cannot receive new messages."
            : "This is the beginning of your conversation. Start chatting with the AI agent to get assistance with your projects."}
        </p>
      </div>

      {!isArchived && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-lg mb-2">💬</div>
            <h4 className="font-medium text-sm mb-1">
              Natural Conversation
            </h4>
            <p className="text-xs text-muted-foreground">
              Chat naturally with the AI agent
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-lg mb-2">🎯</div>
            <h4 className="font-medium text-sm mb-1">
              Specialized Assistance
            </h4>
            <p className="text-xs text-muted-foreground">
              Get specific help for development
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="text-lg mb-2">⚡</div>
            <h4 className="font-medium text-sm mb-1">
              Quick Responses
            </h4>
            <p className="text-xs text-muted-foreground">
              Get instant and accurate assistance
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
