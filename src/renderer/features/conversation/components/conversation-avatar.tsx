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
    sm: "size-8 text-xs",
    md: "size-9 text-sm",
    lg: "size-11 text-base",
  };

  // Group avatar sizes - smaller for overlapped display
  const groupSizeClasses = {
    sm: "size-6 text-xs",
    md: "size-7 text-xs",
    lg: "size-8 text-sm",
  };

  const statusSizeClasses = {
    sm: "size-2",
    md: "size-3",
    lg: "size-3.5",
  };

  const ringClasses = {
    sm: "ring-1",
    md: "ring-1",
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

  // For group conversations (3+ people), show exactly 2 avatars
  const firstParticipant = otherParticipants[0];
  const totalParticipants = otherParticipants.length;

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
      {/* First avatar - back/top position with user initial and status */}
      <Avatar
        className={cn(
          groupSizeClasses[size],
          ringClasses[size],
          "relative z-10 ring-background shadow-md transition-all duration-200 hover:shadow-lg",
        )}
      >
        <AvatarImage
          src={isValidAvatarUrl(firstParticipant.avatar) || undefined}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 text-foreground font-semibold border border-border/50">
          {firstParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Status indicator - only on the first avatar (back/top) */}
      {showStatus && (
        <div
          className={cn(
            "absolute -top-0.5 -right-0.5 rounded-full border-2 border-background z-20 shadow-sm status-pulse",
            getStatusColor(getUserStatus(firstParticipant)),
            statusSizeClasses[size],
          )}
        />
      )}

      {/* Second avatar - front/bottom position with participant count */}
      <Avatar
        className={cn(
          groupSizeClasses[size],
          ringClasses[size],
          "relative z-20 ring-background shadow-md transition-all duration-200 hover:shadow-lg",
          // Position in front/bottom with overlap
          size === "sm"
            ? "-ml-4 mt-2"
            : size === "md"
              ? "-ml-5 mt-2.5"
              : "-ml-6 mt-3",
        )}
      >
        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-foreground font-semibold border border-border/50">
          +{totalParticipants}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
