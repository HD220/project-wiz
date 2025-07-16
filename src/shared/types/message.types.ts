export type MessageType = "text" | "code" | "image" | "file" | "system";

export interface MessageTypeHandler {
  type: MessageType;
  content: string;
}
