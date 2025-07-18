import { DateUtils } from "@/lib/date-utils";

import type { ConversationDto } from "@/shared/types/users/message.types";

export function useConversationUtils() {
  const getOtherParticipant = (conversation: ConversationDto) => {
    return (
      conversation.participants.find((p: string) => p !== "user") || "Unknown"
    );
  };

  const formatLastMessageTime = (date?: Date) => {
    return DateUtils.formatLastMessageTime(date);
  };

  return {
    getOtherParticipant,
    formatLastMessageTime,
  };
}
