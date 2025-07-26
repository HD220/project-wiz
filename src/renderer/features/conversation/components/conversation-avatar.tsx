import { MessageSquare } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/renderer/components/ui/avatar";
import { cn, isValidAvatarUrl } from "@/renderer/lib/utils";
import type { UserSummary } from "@/main/features/user/user.service";

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
}

function ConversationAvatar(props: ConversationAvatarProps) {
  const {
    participants,
    availableUsers,
    currentUserId,
    size = "md",
    className,
  } = props;

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
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
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback className="bg-muted text-muted-foreground">
          <MessageSquare className="w-1/2 h-1/2" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // For 1:1 conversations, show the other participant's avatar
  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={isValidAvatarUrl(participant.avatar) || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {participant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }

  // For group conversations (3+ people), show 2 avatars of equal size
  const firstParticipant = otherParticipants[0];
  const remainingCount = otherParticipants.length - 1;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {/* Avatar 1: First participant */}
      <Avatar className={cn(sizeClasses[size], "relative z-10")}>
        <AvatarImage
          src={isValidAvatarUrl(firstParticipant.avatar) || undefined}
        />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {firstParticipant.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Avatar 2: Counter badge */}
      <Avatar className={cn(sizeClasses[size], "relative z-0")}>
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
          +{remainingCount}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

export { ConversationAvatar };
