import type { ConversationDto } from "../../../../shared/types/domains/users/message.types";
import { DateUtils } from "../../../lib/date-utils";

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
