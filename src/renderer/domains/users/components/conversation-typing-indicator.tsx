import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";

interface ConversationTypingIndicatorProps {
  agentName: string;
}

export function ConversationTypingIndicator({
  agentName,
}: ConversationTypingIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-purple-500">
          {agentName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 text-muted-foreground bg-muted rounded-lg px-3 py-2">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-current rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="text-sm">{agentName} está digitando...</span>
      </div>
    </div>
  );
}
