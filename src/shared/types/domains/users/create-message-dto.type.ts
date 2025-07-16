import { MessageMetadata } from "./message-metadata.type";

export interface CreateMessageDto {
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  conversationId: string;
  contextType?: "direct" | "channel" | "group";
  contextId?: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: MessageMetadata;
}
