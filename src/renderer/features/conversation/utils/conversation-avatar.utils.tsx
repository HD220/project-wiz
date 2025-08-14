import { Hash } from "lucide-react";

import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/features/user/components/profile-avatar";

import type { User } from "@/shared/types/user";

// Participant from API (just IDs and metadata)
interface DMParticipant {
  id: string;
  ownerId: string;
  dmConversationId: string;
  participantId: string;
  isActive: boolean;
  deactivatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get users from participants by matching participantId with user.id
 */
export function getParticipantUsers(
  participants: DMParticipant[],
  availableUsers: User[],
  currentUserId: string,
): User[] {
  // Create a map for faster lookup
  const userMap = new Map(availableUsers.map((user) => [user.id, user]));

  // Get user objects for each participant, excluding current user
  return participants
    .filter((participant) => participant.participantId !== currentUserId)
    .map((participant) => userMap.get(participant.participantId))
    .filter((user): user is User => user !== undefined);
}

/**
 * Get other participants in a conversation (excluding current user) - Legacy
 */
export function getOtherParticipants(
  participants: User[],
  currentUserId: string,
): User[] {
  return participants.filter((participant) => participant.id !== currentUserId);
}

/**
 * Create conversation avatar component based on participants (legacy function)
 */
export function createConversationAvatar(
  otherParticipants: User[],
  size: "sm" | "md" | "lg" = "sm",
) {
  // If no other participants, show fallback
  if (otherParticipants.length === 0) {
    return (
      <ProfileAvatar size={size}>
        <ProfileAvatarImage fallbackIcon={<Hash className="w-1/2 h-1/2" />} />
      </ProfileAvatar>
    );
  }

  const firstParticipant = otherParticipants[0];

  if (!firstParticipant) {
    return (
      <ProfileAvatar size={size}>
        <ProfileAvatarImage fallbackIcon={<Hash className="w-1/2 h-1/2" />} />
      </ProfileAvatar>
    );
  }

  // Calculate if should show counter: only for groups with 3+ total participants (2+ other participants)
  const shouldShowCounter = otherParticipants.length > 1;
  const counterValue = otherParticipants.length - 1; // Remaining others besides the displayed avatar

  return (
    <ProfileAvatar size={size}>
      <ProfileAvatarImage
        src={firstParticipant.avatar}
        name={firstParticipant.name}
      />
      <ProfileAvatarStatus id={firstParticipant.id} size={size} />
      {shouldShowCounter && (
        <ProfileAvatarCounter count={counterValue} size={size} />
      )}
    </ProfileAvatar>
  );
}
