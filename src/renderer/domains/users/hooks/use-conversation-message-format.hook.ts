import type { MessageDto } from "../../../../shared/types/domains/users/user.types";

export function useConversationMessageFormat(agentName: string) {
  const convertToMessageFormat = (msg: MessageDto) => ({
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    senderName: msg.senderId === "user" ? "João Silva" : agentName,
    senderType: msg.senderType,
    messageType: "text" as const,
    timestamp: new Date(msg.timestamp || msg.createdAt),
    isEdited: false,
    mentions: [],
  });

  return { convertToMessageFormat };
}