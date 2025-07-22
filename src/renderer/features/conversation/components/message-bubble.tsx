import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/lib/utils";

import type { SelectMessage, AuthenticatedUser } from "../types";

interface MessageBubbleProps {
  message: SelectMessage;
  author?: AuthenticatedUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  isSending?: boolean;
  className?: string;
}

function MessageBubble(props: MessageBubbleProps) {
  const { message, author, showAvatar = true, isSending = false, className } = props;

  // Format timestamp - Discord style (short format)
  const getTimeAgo = () => {
    try {
      const now = new Date();
      const messageDate = new Date(message.createdAt);
      const diffInHours = Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        // Same day - show time
        return messageDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // Different day - show relative time
        return formatDistanceToNow(messageDate, {
          addSuffix: false,
          locale: ptBR,
        });
      }
    } catch {
      return "agora";
    }
  };

  // Get author display info
  const authorName = author?.name || "Unknown";
  const authorAvatar = author?.avatar;
  const authorInitials = authorName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "flex gap-3 group hover:bg-muted/30 px-4 py-1.5 transition-colors",
        className
      )}
    >
      {/* Avatar - always on the left (Discord style) */}
      <div className="flex-shrink-0 w-10">
        {showAvatar ? (
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar || undefined} />
            <AvatarFallback className="text-sm font-medium">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
        ) : (
          /* Spacer for grouped messages */
          <div className="w-10 h-5" />
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Author and timestamp header - only show for first message in group */}
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-medium text-foreground hover:underline cursor-pointer">
              {authorName}
            </span>
            
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              {getTimeAgo()}
            </span>
          </div>
        )}

        {/* Message text - Discord style (no bubbles) */}
        <div className="text-sm text-foreground leading-relaxed break-words">
          <div className="flex items-center gap-2">
            <p className="whitespace-pre-wrap flex-1">{message.content}</p>
            {isSending && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Sending...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };