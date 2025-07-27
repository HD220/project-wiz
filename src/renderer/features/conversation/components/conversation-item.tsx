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
import { isValidAvatarUrl, cn } from "@/renderer/lib/utils";

interface ConversationItemProps {
  conversation: ConversationWithParticipants;
  lastMessage?: SelectMessage | null;
  otherParticipants: AuthenticatedUser[];
  isSelected?: boolean;
  onClick: () => void;
  className?: string;
}

// Avatar composition for better reusability
interface ConversationAvatarProps {
  otherParticipants: AuthenticatedUser[];
  className?: string;
}

export function ConversationAvatar({
  otherParticipants,
  className,
}: ConversationAvatarProps) {
  const isGroup = otherParticipants.length > 1;
  const participant = otherParticipants[0];

  const avatarImage = isGroup
    ? null
    : isValidAvatarUrl(participant?.avatar) || null;
  const avatarFallback = isGroup
    ? otherParticipants.length.toString()
    : participant?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <Avatar className="w-10 h-10">
        <AvatarImage src={avatarImage || undefined} />
        <AvatarFallback className="text-sm font-medium">
          {isGroup ? <Users className="h-4 w-4" /> : avatarFallback}
        </AvatarFallback>
      </Avatar>

      {isGroup && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
          <Users className="h-2.5 w-2.5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// Header composition for name and metadata
interface ConversationHeaderProps {
  displayName: string;
  otherParticipants: AuthenticatedUser[];
}

export function ConversationHeader({
  displayName,
  otherParticipants,
}: ConversationHeaderProps) {
  const isGroup = otherParticipants.length > 1;

  return (
    <div className="flex items-center justify-between gap-2 mb-1">
      <h3 className="font-medium text-sm truncate">{displayName}</h3>

      {isGroup && (
        <Badge variant="secondary" className="text-xs px-2 py-0.5 shrink-0">
          {otherParticipants.length + 1}
        </Badge>
      )}
    </div>
  );
}

// Message preview composition
interface MessagePreviewProps {
  lastMessage?: SelectMessage | null;
  timeAgo: string;
}

export function MessagePreview({ lastMessage, timeAgo }: MessagePreviewProps) {
  const messagePreview = lastMessage
    ? lastMessage.content.length > 60
      ? `${lastMessage.content.substring(0, 60)}...`
      : lastMessage.content
    : "No messages yet";

  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground truncate flex-1">
        {messagePreview}
      </p>

      {timeAgo && (
        <span className="text-xs text-muted-foreground shrink-0">
          {timeAgo}
        </span>
      )}
    </div>
  );
}

// Group participants display
interface GroupParticipantsProps {
  otherParticipants: AuthenticatedUser[];
}

export function GroupParticipants({
  otherParticipants,
}: GroupParticipantsProps) {
  if (otherParticipants.length <= 1) return null;

  return (
    <div className="flex items-center gap-1 mt-1">
      <User className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground truncate">
        {otherParticipants
          .slice(0, 2)
          .map((participant) => participant.name)
          .join(", ")}
        {otherParticipants.length > 2 && ` +${otherParticipants.length - 2}`}
      </span>
    </div>
  );
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

  // Get display name for conversation - inline logic kept simple
  const displayName =
    conversation.name ||
    (otherParticipants.length === 1
      ? otherParticipants[0]?.name || "Unknown"
      : otherParticipants.length > 1
        ? `Grupo ${otherParticipants.length + 1}`
        : "New Conversation");

  // Format timestamp - simplified without debug logs
  const timeAgo = lastMessage
    ? (() => {
        try {
          const messageDate = new Date(lastMessage.createdAt);
          const now = new Date();
          const diffInHours =
            (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

          if (diffInHours < 24) {
            return new Intl.DateTimeFormat("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(messageDate);
          }

          const days = Math.floor(diffInHours / 24);
          return `${days}d`;
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "w-full p-3 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50",
        "transition-all duration-150 cursor-pointer",
        isSelected ? "bg-muted border-border shadow-sm" : "bg-card",
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
        <ConversationAvatar otherParticipants={otherParticipants} />

        <div className="flex-1 min-w-0">
          <ConversationHeader
            displayName={displayName}
            otherParticipants={otherParticipants}
          />

          <MessagePreview lastMessage={lastMessage} timeAgo={timeAgo} />

          <GroupParticipants otherParticipants={otherParticipants} />
        </div>
      </div>
    </div>
  );
}
