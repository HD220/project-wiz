import { Loader2, User, Check, CheckCheck, Clock } from "lucide-react";

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
import { cn, isValidAvatarUrl, getTimeAgo } from "@/renderer/lib/utils";

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
  // Message state props for enhanced UX
  messageState?: "sending" | "sent" | "delivered" | "read" | "failed";
}

export function MessageBubble(props: MessageBubbleProps) {
  const {
    message,
    author,
    isCurrentUser,
    showAvatar = true,
    isSending = false,
    className,
    authorIsInactive = false,
    originalAuthorName,
    messageState,
  } = props;

  // Get author display info with proper fallbacks for inactive agents - inline logic
  const authorInfo = author
    ? {
        name: author.name,
        avatar: author.avatar,
        isInactive: authorIsInactive,
      }
    : originalAuthorName
      ? {
          name: originalAuthorName,
          avatar: null,
          isInactive: true,
        }
      : {
          name: "Agente Removido",
          avatar: null,
          isInactive: true,
        };

  const timeAgo = getTimeAgo(message.createdAt);
  const authorInitials = authorInfo.name.charAt(0).toUpperCase();

  // Status indicator logic inline - simplified from 45+ lines to 10 lines
  const renderStatus = () => {
    if (!isCurrentUser) return null;

    if (isSending) {
      return (
        <div className="flex items-center gap-[var(--spacing-component-sm)] text-muted-foreground/60 ml-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span className="text-xs">Enviando...</span>
        </div>
      );
    }

    const statusIcons = {
      sent: <Check className="w-3 h-3 text-muted-foreground/60" />,
      delivered: <CheckCheck className="w-3 h-3 text-chart-2/80" />,
      read: <CheckCheck className="w-3 h-3 text-chart-5/80" />,
      failed: <Clock className="w-3 h-3 text-destructive/80" />,
    };

    const state = messageState || "sent";
    return statusIcons[state] ? (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {statusIcons[state]}
      </div>
    ) : null;
  };

  return (
    <div
      className={cn(
        "relative flex gap-[var(--spacing-component-md)] group px-4 rounded-sm",
        "hover:bg-muted/10",
        showAvatar
          ? "py-[var(--spacing-component-md)] mt-1"
          : "py-[var(--spacing-component-xs)]",
        authorInfo.isInactive && "opacity-80",
        isSending && "animate-pulse",
        className,
      )}
    >
      {/* Avatar or time placeholder - inline logic */}
      <div className="flex-shrink-0 w-10">
        {showAvatar ? (
          <Avatar
            className={cn(
              "size-10",
              authorInfo.isInactive && "opacity-60 grayscale",
            )}
          >
            <AvatarImage
              src={isValidAvatarUrl(authorInfo.avatar) || undefined}
              className="object-cover"
            />
            <AvatarFallback
              className={cn(
                "text-sm font-semibold",
                authorInfo.isInactive
                  ? "bg-muted/60 text-muted-foreground"
                  : "bg-primary/15 text-primary",
              )}
            >
              {authorInfo.isInactive ? (
                <User className="h-4 w-4" />
              ) : (
                authorInitials
              )}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="text-xs text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {timeAgo}
            </span>
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 space-y-[var(--spacing-component-xs)]">
        {/* Author header - inline logic */}
        {showAvatar && (
          <div className="flex items-baseline gap-[var(--spacing-component-md)] mb-1">
            <div className="flex items-center gap-[var(--spacing-component-sm)]">
              <span
                className={cn(
                  "text-sm font-semibold hover:underline cursor-pointer",
                  authorInfo.isInactive
                    ? "text-muted-foreground"
                    : "text-foreground hover:text-primary",
                )}
              >
                {authorInfo.name}
              </span>

              {authorInfo.isInactive && (
                <Badge
                  variant="outline"
                  className="h-5 px-[var(--spacing-component-sm)] text-xs bg-muted/40 text-muted-foreground"
                >
                  Inativo
                </Badge>
              )}
            </div>

            <span className="text-xs text-muted-foreground/80">{timeAgo}</span>
          </div>
        )}

        {/* Message text with status - inline logic */}
        <div
          className={cn(
            "text-sm leading-relaxed break-words",
            authorInfo.isInactive
              ? "text-muted-foreground/80"
              : "text-foreground",
          )}
        >
          <div className="flex items-end gap-[var(--spacing-component-sm)]">
            <div className="flex-1 min-w-0">
              <p className="whitespace-pre-wrap selection:bg-primary/20">
                {message.content}
              </p>
            </div>
            {renderStatus()}
          </div>
        </div>
      </div>
    </div>
  );
}
