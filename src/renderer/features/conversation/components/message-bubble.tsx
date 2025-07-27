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
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

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

// Author avatar composition
interface MessageAuthorAvatarProps {
  authorInfo: {
    name: string;
    avatar: string | null | undefined;
    isInactive: boolean;
  };
  showAvatar: boolean;
  timeAgo: string;
}

function MessageAuthorAvatar({
  authorInfo,
  showAvatar,
  timeAgo,
}: MessageAuthorAvatarProps) {
  const authorInitials = authorInfo.name.charAt(0).toUpperCase();

  if (showAvatar) {
    return (
      <div className="flex-shrink-0 w-10">
        <Avatar
          className={cn("w-10 h-10", authorInfo.isInactive && "opacity-60")}
        >
          <AvatarImage src={isValidAvatarUrl(authorInfo.avatar) || undefined} />
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
    );
  }

  return (
    <div className="flex-shrink-0 w-10 flex justify-center">
      <span className="text-xs text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity leading-6">
        {timeAgo}
      </span>
    </div>
  );
}

// Author header composition
interface MessageAuthorHeaderProps {
  authorInfo: {
    name: string;
    isInactive: boolean;
  };
  timeAgo: string;
}

function MessageAuthorHeader({
  authorInfo,
  timeAgo,
}: MessageAuthorHeaderProps) {
  return (
    <div className="flex items-baseline gap-2 mb-0.5">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-semibold hover:underline cursor-pointer",
            authorInfo.isInactive ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {authorInfo.name}
        </span>

        {authorInfo.isInactive && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-xs font-medium bg-muted/50 text-muted-foreground border-0"
          >
            Inativo
          </Badge>
        )}
      </div>

      <span className="text-xs text-muted-foreground/70">{timeAgo}</span>
    </div>
  );
}

// Message content composition
interface MessageContentProps {
  message: SelectMessage;
  authorInfo: {
    isInactive: boolean;
  };
  isSending: boolean;
}

function MessageContent({
  message,
  authorInfo,
  isSending,
}: MessageContentProps) {
  return (
    <div
      className={cn(
        "text-sm leading-[1.375] break-words",
        authorInfo.isInactive ? "text-muted-foreground" : "text-foreground",
      )}
    >
      <div className="flex items-start gap-2">
        <p className="whitespace-pre-wrap flex-1 min-w-0">{message.content}</p>
        {isSending && (
          <div className="flex items-center gap-1 text-muted-foreground/70 flex-shrink-0">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-xs">Enviando...</span>
          </div>
        )}
      </div>
    </div>
  );
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

  // Format timestamp - simplified without debug logs
  const getTimeAgo = () => {
    try {
      const messageDate = new Date(message.createdAt);
      const now = new Date();
      const diffInHours =
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(messageDate);
      }

      const days = Math.floor(diffInHours / 24);
      return `${days} dias`;
    } catch {
      return "agora";
    }
  };

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

  const timeAgo = getTimeAgo();

  return (
    <div
      className={cn(
        "relative flex gap-3 group hover:bg-muted/20 transition-colors px-4",
        showAvatar ? "py-2 mt-0.5" : "py-0.5",
        authorInfo.isInactive && "opacity-75",
        className,
      )}
    >
      <MessageAuthorAvatar
        authorInfo={authorInfo}
        showAvatar={showAvatar}
        timeAgo={timeAgo}
      />

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <MessageAuthorHeader authorInfo={authorInfo} timeAgo={timeAgo} />
        )}

        <MessageContent
          message={message}
          authorInfo={authorInfo}
          isSending={isSending}
        />
      </div>
    </div>
  );
}

export { MessageBubble };
