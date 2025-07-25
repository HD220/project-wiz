import { Loader2, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
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
  // Extended props for handling inactive agents
  authorIsInactive?: boolean;
  originalAuthorName?: string;
}

function MessageBubble(props: MessageBubbleProps) {
  const {
    message,
    author,
    showAvatar = true,
    isSending = false,
    className,
    authorIsInactive = false,
    originalAuthorName,
  } = props;

  // Format timestamp - simples: horário ou dias
  const getTimeAgo = () => {
    try {
      console.log("🔍 MESSAGE BUBBLE DEBUG:", {
        "Raw createdAt": message.createdAt,
        "Type of createdAt": typeof message.createdAt,
        "Date constructor": new Date(message.createdAt),
        "Date toString": new Date(message.createdAt).toString(),
        "Date getTime": new Date(message.createdAt).getTime(),
        Now: new Date().toString(),
        "Timezone offset (minutes)": new Date().getTimezoneOffset(),
      });

      const messageDate = new Date(message.createdAt);
      const now = new Date();

      const diffInHours =
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Menos de 24h - mostrar horário
        const formatted = new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(messageDate);

        console.log("🕐 MESSAGE BUBBLE TIME:", {
          "Formatted time": formatted,
          "Message date": messageDate.toString(),
          "Hours diff": diffInHours,
        });

        return formatted;
      }
      // Mais de 24h - mostrar dias
      const days = Math.floor(diffInHours / 24);
      return `${days} dias`;
    } catch (error) {
      console.error("❌ MESSAGE BUBBLE TIME ERROR:", error);
      return "agora";
    }
  };

  // Get author display info with proper fallbacks for inactive agents
  const getAuthorInfo = () => {
    // If we have author info, use that
    if (author) {
      return {
        name: author.name,
        avatar: author.avatar,
        isInactive: authorIsInactive,
      };
    }

    // If author is missing but we have original name (from when agent was active)
    if (originalAuthorName) {
      return {
        name: originalAuthorName,
        avatar: null,
        isInactive: true,
      };
    }

    // Complete fallback for when we have no author info at all
    return {
      name: "Agente Removido",
      avatar: null,
      isInactive: true,
    };
  };

  const authorInfo = getAuthorInfo();
  const authorInitials = authorInfo.name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex gap-3 group hover:bg-muted/20 transition-colors px-4",
        showAvatar ? "py-2 mt-0.5" : "py-0.5",
        // Add visual distinction for inactive agent messages
        authorInfo.isInactive && "opacity-75",
        className,
      )}
    >
      {/* Avatar - only show when needed */}
      {showAvatar ? (
        <div className="flex-shrink-0 w-10">
          <Avatar
            className={cn("w-10 h-10", authorInfo.isInactive && "opacity-60")}
          >
            <AvatarImage src={authorInfo.avatar || undefined} />
            <AvatarFallback
              className={cn(
                "text-sm font-medium bg-primary/10 text-primary",
                authorInfo.isInactive && "bg-muted/50 text-muted-foreground",
              )}
            >
              {authorInfo.isInactive ? (
                <User className="h-4 w-4" />
              ) : (
                authorInitials
              )}
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
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-semibold hover:underline cursor-pointer",
                  authorInfo.isInactive
                    ? "text-muted-foreground"
                    : "text-foreground",
                )}
              >
                {authorInfo.name}
              </span>

              {/* Inactive badge for removed agents */}
              {authorInfo.isInactive && (
                <Badge
                  variant="secondary"
                  className="h-4 px-1.5 text-xs font-medium bg-muted/50 text-muted-foreground border-0"
                >
                  Inativo
                </Badge>
              )}
            </div>

            <span className="text-xs text-muted-foreground/70">
              {getTimeAgo()}
            </span>
          </div>
        )}

        {/* Message text - Discord style (no bubbles) */}
        <div
          className={cn(
            "text-sm leading-[1.375] break-words",
            authorInfo.isInactive ? "text-muted-foreground" : "text-foreground",
          )}
        >
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
    </div>
  );
}

export { MessageBubble };
