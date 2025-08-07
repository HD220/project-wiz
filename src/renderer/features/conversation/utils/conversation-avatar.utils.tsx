import { Hash } from "lucide-react";

import type { User } from "@/shared/types/user";

import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/features/user/components/profile-avatar";

/**
 * Get other participants in a conversation (excluding current user)
 */
export function getOtherParticipants(
  participants: User[],
  currentUserId: string
): User[] {
  return participants.filter(participant => participant.id !== currentUserId);
}

/**
 * Create conversation avatar component based on participants
 */
export function createConversationAvatar(
  otherParticipants: User[],
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