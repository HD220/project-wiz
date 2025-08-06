import { User as UserIcon, Hash } from "lucide-react";

import { Badge } from "@/renderer/components/ui/badge";
import type { DMConversation } from "@/shared/types/dm-conversation";
import type { User } from "@/shared/types/user";
import type { Message } from "@/shared/types/message";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/features/user/components/profile-avatar";
import { cn, getTimeAgo } from "@/renderer/lib/utils";

interface ConversationItemProps {
  conversation: DMConversation;
  lastMessage?: Message | null;
  otherParticipants: User[];
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
        ? `Group ${otherParticipants.length + 1}`
        : "New Conversation");

  // Use existing getTimeAgo utility
  const timeAgo = lastMessage ? getTimeAgo(lastMessage.createdAt) : "";

  // Avatar logic inline - simplified for ProfileAvatar
  const isGroup = otherParticipants.length > 1;
  const participant = otherParticipants[0];

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
        {/* Avatar - using ProfileAvatar system */}
        <div className="relative flex-shrink-0">
          {(() => {
            // If no participants, show fallback
            if (otherParticipants.length === 0) {
              return (
                <ProfileAvatar size="sm">
                  <ProfileAvatarImage
                    fallbackIcon={<Hash className="w-1/2 h-1/2" />}
                  />
                </ProfileAvatar>
              );
            }

            // For 1:1 conversations, show single avatar
            if (otherParticipants.length === 1) {
              if (!participant) {
                return (
                  <ProfileAvatar size="sm">
                    <ProfileAvatarImage
                      fallbackIcon={<Hash className="w-1/2 h-1/2" />}
                    />
                  </ProfileAvatar>
                );
              }
              return (
                <ProfileAvatar size="sm">
                  <ProfileAvatarImage
                    src={participant.avatar}
                    name={participant.name}
                  />
                  <ProfileAvatarStatus id={participant.id} size="sm" />
                </ProfileAvatar>
              );
            }

            // For group conversations, show main avatar + counter
            const remainingCount = otherParticipants.length - 1;
            if (!participant) {
              return (
                <ProfileAvatar size="sm">
                  <ProfileAvatarImage
                    fallbackIcon={<Hash className="w-1/2 h-1/2" />}
                  />
                </ProfileAvatar>
              );
            }
            return (
              <ProfileAvatar size="sm">
                <ProfileAvatarImage
                  src={participant.avatar}
                  name={participant.name}
                />
                <ProfileAvatarStatus id={participant.id} size="sm" />
                {remainingCount > 0 && (
                  <ProfileAvatarCounter count={remainingCount} size="sm" />
                )}
              </ProfileAvatar>
            );
          })()}
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
              <UserIcon className="h-3 w-3 text-muted-foreground/70" />
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
