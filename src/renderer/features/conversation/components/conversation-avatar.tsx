import { MessageSquare, Crown, Zap } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";

type UserStatus = "online" | "away" | "busy" | "offline";

const getStatusColor = (status: UserStatus): string => {
  switch (status) {
    case "online":
      return "bg-emerald-500 shadow-emerald-500/30";
    case "away":
      return "bg-amber-500 shadow-amber-500/30";
    case "busy":
      return "bg-red-500 shadow-red-500/30";
    case "offline":
    default:
      return "bg-gray-400 shadow-gray-400/20";
  }
};

const getUserStatus = (user: UserSummary): UserStatus => {
  // TODO: Implement actual user status logic based on real data
  // For demo purposes, randomly assign status based on user ID
  const hash = user.id.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const statusIndex = Math.abs(hash) % 4;
  const statuses: UserStatus[] = ["online", "away", "busy", "offline"];
  return statuses[statusIndex] || "offline"; // Fallback to offline
};

interface ConversationAvatarProps {
  participants: Array<{
    id: string;
    conversationId: string;
    participantId: string;
    isActive: boolean;
    deactivatedAt: Date | null;
    deactivatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  availableUsers: UserSummary[];
  currentUserId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showStatus?: boolean;
}

export function ConversationAvatar(props: ConversationAvatarProps) {
  const {
    participants,
    availableUsers,
    currentUserId,
    size = "md",
    className,
    showStatus = false,
  } = props;

  const sizeClasses = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-11 text-base",
  };

  const statusSizeClasses = {
    sm: "size-2.5",
    md: "size-3",
    lg: "size-3.5",
  };

  const ringClasses = {
    sm: "ring-1",
    md: "ring-2",
    lg: "ring-2",
  };

  // Get other participants (exclude current user)
  const otherParticipants = participants
    .filter((participant) => participant.participantId !== currentUserId)
    .map((participant) =>
      availableUsers.find((user) => user.id === participant.participantId),
    )
    .filter(Boolean) as UserSummary[];

  // If no other participants or no participants data, show fallback
  if (!participants.length || otherParticipants.length === 0) {
    return (
      <div className="relative">
        <Avatar
          className={cn(
            sizeClasses[size],
            ringClasses[size],
            "ring-background shadow-md transition-all duration-200",
            className,
          )}
        >
          <AvatarFallback className="bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground border border-border/50">
            <MessageSquare className="w-1/2 h-1/2" />
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background shadow-sm",
              "bg-gray-400 shadow-gray-400/20",
              statusSizeClasses[size],
            )}
          />
        )}
      </div>
    );
  }

  // For 1:1 conversations, show the other participant's avatar
  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    if (!participant) {
      return (
        <div className="relative">
          <Avatar className={cn(sizeClasses[size], className)}>
            <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
              <MessageSquare className="w-1/2 h-1/2" />
            </AvatarFallback>
          </Avatar>
          {showStatus && (
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 bg-gray-400 rounded-full border-2 border-background",
                statusSizeClasses[size],
              )}
            />
          )}
        </div>
      );
    }

    return (
      <div className="relative">
        <Avatar
          className={cn(
            sizeClasses[size],
            ringClasses[size],
            "ring-background shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01]",
            className,
          )}
        >
          <AvatarImage
            src={isValidAvatarUrl(participant.avatar) || undefined}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 text-foreground font-semibold border border-border/50">
            {participant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {showStatus && participant && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background shadow-sm status-pulse",
              getStatusColor(getUserStatus(participant)),
              statusSizeClasses[size],
            )}
          />
        )}
      </div>
    );
  }

  // For group conversations (3+ people), show overlapping avatars
  const firstParticipant = otherParticipants[0];
  const secondParticipant = otherParticipants[1];
  const remainingCount = Math.max(0, otherParticipants.length - 2);

  if (!firstParticipant) {
    return (
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarFallback className="bg-gradient-to-br from-gray-400 to-gray-600 text-white">
            <MessageSquare className="w-1/2 h-1/2" />
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 bg-gray-400 rounded-full border-2 border-background",
              statusSizeClasses[size],
            )}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative flex", className)}>
      {/* First participant avatar */}
      <Avatar
        className={cn(
          sizeClasses[size],
          ringClasses[size],
          "relative z-20 ring-background shadow-md transition-all duration-200 hover:shadow-lg",
        )}
      >
        <AvatarImage
          src={isValidAvatarUrl(firstParticipant.avatar) || undefined}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 text-foreground font-semibold border border-border/50">
          {firstParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Second participant or counter */}
      <Avatar
        className={cn(
          sizeClasses[size],
          ringClasses[size],
          "relative z-10 -ml-3 ring-background shadow-md transition-all duration-200 hover:shadow-lg",
        )}
      >
        {secondParticipant ? (
          <>
            <AvatarImage
              src={isValidAvatarUrl(secondParticipant.avatar) || undefined}
            />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 text-foreground font-semibold border border-border/50">
              {secondParticipant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-muted to-muted-foreground/20 text-muted-foreground font-semibold border border-border/50">
            +{remainingCount}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Additional count indicator if more than 2 extra participants */}
      {remainingCount > 0 && secondParticipant && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full text-xs font-bold shadow-md",
            "flex items-center justify-center min-w-[1.25rem] h-5 px-1 z-30 ring-2 ring-background border border-primary/20",
            "transition-all duration-200 hover:scale-[1.01]",
          )}
        >
          <Crown className="h-2.5 w-2.5 mr-0.5" />
          {remainingCount}
        </div>
      )}

      {/* Status indicator for group - show if any user is online */}
      {showStatus && (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background z-30 shadow-sm status-pulse",
            // For group conversations, show emerald if any participant is online
            otherParticipants.some((p) => getUserStatus(p) === "online")
              ? "bg-emerald-500 shadow-emerald-500/30"
              : "bg-gray-400 shadow-gray-400/20",
            statusSizeClasses[size],
          )}
        >
          {otherParticipants.some((p) => getUserStatus(p) === "online") && (
            <Zap className="h-1.5 w-1.5 text-white absolute inset-0.5" />
          )}
        </div>
      )}
    </div>
  );
}
