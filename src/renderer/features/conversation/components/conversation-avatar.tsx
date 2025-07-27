import { MessageSquare } from "lucide-react";

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
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "busy":
      return "bg-red-500";
    case "offline":
    default:
      return "bg-gray-400";
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
  return statuses[statusIndex];
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

function ConversationAvatar(props: ConversationAvatarProps) {
  const {
    participants,
    availableUsers,
    currentUserId,
    size = "md",
    className,
    showStatus = false,
  } = props;

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const statusSizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
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

  // For 1:1 conversations, show the other participant's avatar
  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    return (
      <div className="relative">
        <Avatar className={cn(sizeClasses[size], className)}>
          <AvatarImage
            src={isValidAvatarUrl(participant.avatar) || undefined}
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {participant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
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

  return (
    <div className={cn("relative flex", className)}>
      {/* First participant avatar */}
      <Avatar
        className={cn(
          sizeClasses[size],
          "relative z-20 ring-2 ring-background",
        )}
      >
        <AvatarImage
          src={isValidAvatarUrl(firstParticipant.avatar) || undefined}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {firstParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Second participant or counter */}
      <Avatar
        className={cn(
          sizeClasses[size],
          "relative z-10 -ml-3 ring-2 ring-background",
        )}
      >
        {secondParticipant ? (
          <>
            <AvatarImage
              src={isValidAvatarUrl(secondParticipant.avatar) || undefined}
            />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white font-semibold">
              {secondParticipant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
            +{remainingCount}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Additional count indicator if more than 2 extra participants */}
      {remainingCount > 0 && secondParticipant && (
        <div
          className={cn(
            "absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs font-bold",
            "flex items-center justify-center min-w-[1.25rem] h-5 px-1 z-30 ring-2 ring-background",
          )}
        >
          +{remainingCount}
        </div>
      )}

      {/* Status indicator for group - show if any user is online */}
      {showStatus && (
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background z-30",
            // For group conversations, show green if any participant is online
            otherParticipants.some((p) => getUserStatus(p) === "online")
              ? "bg-green-500"
              : "bg-gray-400",
            statusSizeClasses[size],
          )}
        />
      )}
    </div>
  );
}

export { ConversationAvatar };
