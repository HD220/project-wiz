import { MessageMetadata } from "./message-metadata.type";

export interface MessageDto {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  conversationId: string;
  createdAt: Date;
  contextType?: "direct" | "channel" | "group";
  contextId?: string;
  type?: "text" | "code" | "file" | "system";
  metadata?: MessageMetadata;
  isEdited?: boolean;
  updatedAt?: Date;
  timestamp?: Date;
}
