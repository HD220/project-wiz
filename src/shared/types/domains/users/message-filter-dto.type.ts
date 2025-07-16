export interface MessageFilterDto {
  contextId?: string;
  contextType?: "direct" | "channel" | "group";
  senderId?: string;
  senderType?: "user" | "agent" | "system";
  type?: "text" | "code" | "file" | "system";
}
