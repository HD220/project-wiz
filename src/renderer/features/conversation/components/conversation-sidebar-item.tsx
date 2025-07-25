import { MessageCircle } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import { CustomLink } from "@/renderer/components/custom-link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import type {
  ConversationWithLastMessage,
  SelectMessage,
} from "@/renderer/features/conversation/types";
import { cn } from "@/renderer/lib/utils";

interface ConversationSidebarItemProps {
  conversation: ConversationWithLastMessage;
  lastMessage?: SelectMessage | null;
  otherParticipants: UserSummary[];
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

  // Format timestamp - simples: horário pt-BR ou dias
  const getTimeAgo = () => {
    if (!lastMessage) return "";

    try {
      console.log("🔍 SIDEBAR DEBUG:", {
        "Raw createdAt": lastMessage.createdAt,
        "Type of createdAt": typeof lastMessage.createdAt,
        "Date constructor": new Date(lastMessage.createdAt),
        "Date toString": new Date(lastMessage.createdAt).toString(),
        "Date getTime": new Date(lastMessage.createdAt).getTime(),
        Now: new Date().toString(),
        "Timezone offset (minutes)": new Date().getTimezoneOffset(),
      });

      const messageDate = new Date(lastMessage.createdAt);
      const now = new Date();
      const diffInHours =
        (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        // Menos de 24h - mostrar horário
        const formatted = new Intl.DateTimeFormat("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(messageDate);

        console.log("🕐 SIDEBAR TIME:", {
          "Formatted time": formatted,
          "Message date": messageDate.toString(),
          "Hours diff": diffInHours,
        });

        return formatted;
      } else {
        // Mais de 24h - mostrar dias
        const days = Math.floor(diffInHours / 24);
        return `${days}d`;
      }
    } catch (error) {
      console.error("❌ SIDEBAR TIME ERROR:", error);
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
        "flex items-center gap-3 px-2 py-2 mx-1 rounded-md text-sm transition-all duration-200 group h-auto justify-start",
        "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
        unreadCount > 0 && "font-medium",
        className,
      )}
      activeProps={{
        className: "bg-accent text-foreground",
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatar.image || undefined} />
          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
            {avatar.isGroup ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              avatar.fallback
            )}
          </AvatarFallback>
        </Avatar>

        {/* Online indicator for 1:1 chats */}
        {!avatar.isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
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
