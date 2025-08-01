import { Hash } from "lucide-react";

import type { UserSummary } from "@/main/features/user/user.service";

import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/features/user/components/profile-avatar";

interface ConversationParticipant {
  userId?: string;
  participantId?: string;
  // Other participant properties...
}

interface ConversationWithParticipants {
  participants?: ConversationParticipant[];
  // Other conversation properties...
}

/**
 * Get other participants in a conversation (excluding current user)
 */
export function getOtherParticipants(
  conversation: ConversationWithParticipants,
  currentUserId: string,
  availableUsers: UserSummary[]
): UserSummary[] {
  return (
    conversation.participants
      ?.filter((participant) => 
        (participant.userId || participant.participantId) !== currentUserId
      )
      .map((participant) =>
        availableUsers.find((user) => 
          user.id === (participant.userId || participant.participantId)
        )
      )
      .filter(Boolean) as UserSummary[]
  ) || [];
}

/**
 * Create conversation avatar component based on participants
 */
export function createConversationAvatar(
  otherParticipants: UserSummary[],
  size: "sm" | "md" | "lg" = "sm"
) {
  // If no other participants, show fallback
  if (otherParticipants.length === 0) {
    return (
      <ProfileAvatar size={size}>
        <ProfileAvatarImage
          fallbackIcon={<Hash className="w-1/2 h-1/2" />}
        />
      </ProfileAvatar>
    );
  }

  // For 1:1 conversations, show single avatar
  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    if (!participant) {
      return (
        <ProfileAvatar size={size}>
          <ProfileAvatarImage
            fallbackIcon={<Hash className="w-1/2 h-1/2" />}
          />
        </ProfileAvatar>
      );
    }
    return (
      <ProfileAvatar size={size}>
        <ProfileAvatarImage
          src={participant.avatar}
          name={participant.name}
        />
        <ProfileAvatarStatus id={participant.id} size={size} />
      </ProfileAvatar>
    );
  }

  // For group conversations, show main avatar + counter
  const firstParticipant = otherParticipants[0];
  const remainingCount = otherParticipants.length - 1;

  if (!firstParticipant) {
    return (
      <ProfileAvatar size={size}>
        <ProfileAvatarImage
          fallbackIcon={<Hash className="w-1/2 h-1/2" />}
        />
      </ProfileAvatar>
    );
  }

  return (
    <ProfileAvatar size={size}>
      <ProfileAvatarImage
        src={firstParticipant.avatar}
        name={firstParticipant.name}
      />
      <ProfileAvatarStatus id={firstParticipant.id} size={size} />
      {remainingCount > 0 && (
        <ProfileAvatarCounter count={remainingCount} size={size} />
      )}
    </ProfileAvatar>
  );
}