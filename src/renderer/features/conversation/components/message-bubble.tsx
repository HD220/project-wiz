import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/lib/utils";

import type { MessageWithLlmData, AuthenticatedUser } from "../conversation.types";

interface MessageBubbleProps {
  message: MessageWithLlmData;
  author?: AuthenticatedUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  className?: string;
}

function MessageBubble(props: MessageBubbleProps) {
  const { message, author, isCurrentUser, showAvatar = true, className } = props;

  // Format timestamp
  const getTimeAgo = () => {
    try {
      return formatDistance(new Date(message.createdAt), new Date(), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "agora";
    }
  };

  // Get author display info
  const authorName = author?.name || "Unknown";
  const authorAvatar = author?.avatar;
  const authorInitials = authorName.charAt(0).toUpperCase();
  const isAgent = author?.type === "agent";

  return (
    <div
      className={cn(
        "flex gap-3 group hover:bg-muted/30 px-4 py-2 rounded-md transition-colors",
        isCurrentUser && "flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authorAvatar || undefined} />
              <AvatarFallback className="text-xs font-medium">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            
            {/* Type indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border">
              {isAgent ? (
                <Bot className="h-2.5 w-2.5 text-primary" />
              ) : (
                <User className="h-2.5 w-2.5 text-green-500" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={cn(
        "flex-1 min-w-0",
        isCurrentUser && "text-right"
      )}>
        {/* Author and timestamp header */}
        <div className={cn(
          "flex items-baseline gap-2 mb-1",
          isCurrentUser && "flex-row-reverse"
        )}>
          <span className="text-sm font-medium text-foreground">
            {authorName}
          </span>
          
          {/* Agent badge */}
          {isAgent && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              AI
            </span>
          )}
          
          <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {getTimeAgo()}
          </span>
        </div>

        {/* Message text */}
        <div
          className={cn(
            "text-sm text-foreground leading-relaxed break-words",
            "bg-muted/50 rounded-lg px-3 py-2 inline-block max-w-full",
            isCurrentUser 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50 text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };