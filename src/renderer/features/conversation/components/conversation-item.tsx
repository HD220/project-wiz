import { Users, User } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { Badge } from "@/renderer/components/ui/badge";
import type {
  ConversationWithParticipants,
  AuthenticatedUser,
} from "@/renderer/features/conversation/types";
import type { SelectMessage } from "@/renderer/features/conversation/types";

interface ConversationItemProps {
  conversation: ConversationWithParticipants;
  lastMessage?: SelectMessage | null;
  otherParticipants: AuthenticatedUser[];
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

function ConversationItem(props: ConversationItemProps) {
  const {
    conversation,
    lastMessage,
    otherParticipants,
    isSelected = false,
    onClick,
    className,
  } = props;

  // Get display name for conversation
  const getDisplayName = () => {
    if (conversation.name) {
      return conversation.name;
    }

    if (otherParticipants.length === 1) {
      return otherParticipants[0]?.name || "Unknown";
    } else if (otherParticipants.length > 1) {
      return `Grupo ${otherParticipants.length + 1}`;
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

  // Get preview text for last message
  const getMessagePreview = () => {
    if (!lastMessage) return "No messages yet";

    const maxLength = 60;
    if (lastMessage.content.length > maxLength) {
      return `${lastMessage.content.substring(0, maxLength)}...`;
    }

    return lastMessage.content;
  };

  // Format timestamp
  const getTimeAgo = () => {
    if (!lastMessage) return "";

    try {
      console.log("🔍 CONVERSATION ITEM DEBUG:", {
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

        console.log("🕐 CONVERSATION ITEM TIME:", {
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
      console.error("❌ CONVERSATION ITEM TIME ERROR:", error);
      return "";
    }
  };

  const avatar = getAvatar();
  const displayName = getDisplayName();
  const messagePreview = getMessagePreview();
  const timeAgo = getTimeAgo();

  return (
    <div
      role="button"
      tabIndex={0}
      className={`
        w-full p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 
        transition-all duration-150 cursor-pointer
        ${isSelected ? "bg-muted border-border shadow-sm" : "bg-card"}
        ${className || ""}
      `}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar.image || undefined} />
            <AvatarFallback className="text-sm font-medium">
              {avatar.isGroup ? <Users className="h-4 w-4" /> : avatar.fallback}
            </AvatarFallback>
          </Avatar>

          {/* Group indicator */}
          {avatar.isGroup && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <Users className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm truncate">{displayName}</h3>

            {/* Participants count for groups */}
            {otherParticipants.length > 1 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 shrink-0"
              >
                {otherParticipants.length + 1}
              </Badge>
            )}
          </div>

          {/* Last message preview */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground truncate flex-1">
              {messagePreview}
            </p>

            {/* Timestamp */}
            {timeAgo && (
              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Participants list for groups */}
          {otherParticipants.length > 1 && (
            <div className="flex items-center gap-1 mt-1">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {otherParticipants
                  .slice(0, 2)
                  .map((participant) => participant.name)
                  .join(", ")}
                {otherParticipants.length > 2 &&
                  ` +${otherParticipants.length - 2}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ConversationItem };
