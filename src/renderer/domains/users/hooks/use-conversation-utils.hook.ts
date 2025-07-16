import type { ConversationDto } from "../../../../shared/types/domains/users/user.types";

export function useConversationUtils() {
  const getOtherParticipant = (conversation: ConversationDto) => {
    return (
      conversation.participants.find((p: string) => p !== "user") || "Unknown"
    );
  };

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return "";

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (days === 1) {
      return "Ontem";
    }

    if (days < 7) {
      return `${days}d atrás`;
    }

    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return {
    getOtherParticipant,
    formatLastMessageTime,
  };
}
