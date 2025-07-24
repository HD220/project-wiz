import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, MoreHorizontal, Reply, Smile, Copy } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Button } from "@/renderer/components/ui/button";
import type {
  SelectMessage,
  AuthenticatedUser,
} from "@/renderer/features/conversation/types";
import { cn } from "@/renderer/lib/utils";

interface MessageBubbleProps {
  message: SelectMessage;
  author?: AuthenticatedUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  isSending?: boolean;
  className?: string;
}

function MessageBubble(props: MessageBubbleProps) {
  const {
    message,
    author,
    showAvatar = true,
    isSending = false,
    className,
  } = props;

  // Format timestamp - Discord style (short format)
  const getTimeAgo = () => {
    try {
      const now = new Date();
      const messageDate = new Date(message.createdAt);
      const diffInHours =
        Math.abs(now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Same day - show time
        return messageDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      // Different day - show relative time
      return formatDistanceToNow(messageDate, {
        addSuffix: false,
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

  return (
    <div
      className={cn(
        "relative flex gap-3 group hover:bg-muted/20 transition-colors px-4",
        showAvatar ? "py-2 mt-0.5" : "py-0.5",
        className,
      )}
    >
      {/* Avatar - only show when needed */}
      {showAvatar ? (
        <div className="flex-shrink-0 w-10">
          <Avatar className="w-10 h-10">
            <AvatarImage src={authorAvatar || undefined} />
            <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <div className="flex-shrink-0 w-10 flex justify-center">
          <span className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity leading-6">
            {getTimeAgo()}
          </span>
        </div>
      )}

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Author and timestamp header - only show for first message in group */}
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground hover:underline cursor-pointer">
              {authorName}
            </span>

            <span className="text-xs text-muted-foreground/70">
              {getTimeAgo()}
            </span>
          </div>
        )}

        {/* Message text - Discord style (no bubbles) */}
        <div className="text-sm text-foreground leading-[1.375] break-words">
          <div className="flex items-start gap-2">
            <p className="whitespace-pre-wrap flex-1 min-w-0">
              {message.content}
            </p>
            {isSending && (
              <div className="flex items-center gap-1 text-muted-foreground/70 flex-shrink-0">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-xs">Enviando...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Actions - Discord style (appear on hover) */}
      <div className="absolute -top-2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
        <div className="flex items-center bg-background border rounded-lg shadow-lg px-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent/80"
            title="Reagir"
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent/80"
            title="Responder"
          >
            <Reply className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-accent/80"
            title="Mais opções"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { MessageBubble };
