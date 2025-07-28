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
import { isValidAvatarUrl, cn, getTimeAgo } from "@/renderer/lib/utils";

interface ConversationItemProps {
  conversation: ConversationWithParticipants;
  lastMessage?: SelectMessage | null;
  otherParticipants: AuthenticatedUser[];
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

export function ConversationItem(props: ConversationItemProps) {
  const {
    conversation,
    lastMessage,
    otherParticipants,
    isSelected = false,
    onClick,
    className,
  } = props;

  // Display name inline logic
  const displayName =
    conversation.name ||
    (otherParticipants.length === 1
      ? otherParticipants[0]?.name || "Unknown"
      : otherParticipants.length > 1
        ? `Grupo ${otherParticipants.length + 1}`
        : "New Conversation");

  // Use existing getTimeAgo utility
  const timeAgo = lastMessage ? getTimeAgo(lastMessage.createdAt) : "";

  // Avatar logic inline
  const isGroup = otherParticipants.length > 1;
  const participant = otherParticipants[0];
  const avatarImage = isGroup
    ? null
    : isValidAvatarUrl(participant?.avatar) || null;
  const avatarFallback = isGroup
    ? otherParticipants.length.toString()
    : participant?.name?.charAt(0).toUpperCase() || "?";

  // Message preview inline
  const messagePreview = lastMessage
    ? lastMessage.content.length > 65
      ? `${lastMessage.content.substring(0, 65)}...`
      : lastMessage.content
    : "No messages yet";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group w-full p-2 rounded-lg border transition-all duration-200 cursor-pointer",
        "hover:shadow-sm hover:border-border/80 hover:bg-card/80",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        isSelected
          ? "bg-accent/40 border-primary/30 shadow-sm ring-1 ring-primary/20"
          : "bg-card border-border/40",
        className,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar inline - simplified to 5 lines */}
        <div className="relative flex-shrink-0">
          <Avatar className="size-9">
            <AvatarImage src={avatarImage || undefined} />
            <AvatarFallback className="text-xs">
              {isGroup ? <Users className="h-3 w-3" /> : avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header inline */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-medium text-sm truncate text-foreground">
              {displayName}
            </h3>

            {isGroup && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0.5 shrink-0"
              >
                {otherParticipants.length + 1}
              </Badge>
            )}
          </div>

          {/* Message preview inline */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate flex-1">
              {messagePreview}
            </p>

            {timeAgo && (
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                {timeAgo}
              </span>
            )}
          </div>

          {/* Group participants inline */}
          {isGroup && otherParticipants.length > 1 && (
            <div className="flex items-center gap-1 mt-1">
              <User className="h-3 w-3 text-muted-foreground/70" />
              <span className="text-xs text-muted-foreground/90 truncate">
                {otherParticipants
                  .slice(0, 2)
                  .map((p) => p.name)
                  .join(", ")}
                {otherParticipants.length > 2 &&
                  ` +${otherParticipants.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="flex-shrink-0 w-0.5 h-6 bg-primary rounded-full self-center" />
        )}
      </div>
    </div>
  );
}
