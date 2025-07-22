import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

import { CustomLink } from "@/renderer/components/custom-link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import type {
  ConversationWithLastMessage,
  AuthenticatedUser,
  SelectMessage,
} from "@/renderer/features/conversation/types";
import { cn } from "@/renderer/lib/utils";

interface ConversationSidebarItemProps {
  conversation: ConversationWithLastMessage;
  lastMessage?: SelectMessage | null;
  otherParticipants: AuthenticatedUser[];
  className?: string;
  unreadCount?: number;
}

function ConversationSidebarItem(props: ConversationSidebarItemProps) {
  const {
    conversation,
    lastMessage,
    otherParticipants,
    className,
    unreadCount = 0,
  } = props;

  // Get display name for conversation
  const getDisplayName = () => {
    if (conversation.name) {
      return conversation.name;
    }

    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.name || "Unknown";
    } else if (otherParticipants.length > 1) {
      return `Group ${otherParticipants.length + 1}`;
    }

    return "New Conversation";
  };

  // Get avatar for conversation
  const getAvatar = () => {
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return {
        image: participant?.avatar || null,
        fallback: participant?.name?.charAt(0).toUpperCase() || "?",
        isGroup: false,
      };
    }

    return {
      image: null,
      fallback: otherParticipants.length.toString(),
      isGroup: true,
    };
  };

  // Get message preview
  const getMessagePreview = () => {
    if (!lastMessage) return "No messages yet";

    const maxLength = 30;
    if (lastMessage.content.length > maxLength) {
      return `${lastMessage.content.substring(0, maxLength)}...`;
    }

    return lastMessage.content;
  };

  // Format timestamp
  const getTimeAgo = () => {
    if (!lastMessage) return "";

    try {
      return formatDistanceToNow(new Date(lastMessage.createdAt), {
        addSuffix: false,
        locale: ptBR,
      })
        .replace("cerca de ", "")
        .replace("aproximadamente ", "");
    } catch {
      return "";
    }
  };

  const avatar = getAvatar();
  const displayName = getDisplayName();
  const messagePreview = getMessagePreview();
  const timeAgo = getTimeAgo();

  return (
    <CustomLink
      to="/user/dm/$conversationId"
      params={{ conversationId: conversation.id }}
      variant="ghost"
      className={cn(
        "flex items-center gap-3 px-2 py-2 mx-1 rounded text-sm transition-all duration-150 group h-auto justify-start",
        "hover:bg-muted/50 text-muted-foreground hover:text-foreground",
        className,
      )}
      activeProps={{
        className: "bg-muted text-foreground",
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar.image || undefined} />
          <AvatarFallback className="text-xs font-medium">
            {avatar.isGroup ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              avatar.fallback
            )}
          </AvatarFallback>
        </Avatar>

        {/* Online indicator for 1:1 chats */}
        {!avatar.isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: name and timestamp */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{displayName}</span>

          {/* Timestamp */}
          {timeAgo && (
            <span className="text-xs text-muted-foreground/70 flex-shrink-0">
              {timeAgo}
            </span>
          )}
        </div>

        {/* Bottom row: last message preview */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/80 truncate flex-1">
            {messagePreview}
          </p>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="h-4 px-1.5 text-xs font-medium min-w-[16px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </CustomLink>
  );
}

export { ConversationSidebarItem };
