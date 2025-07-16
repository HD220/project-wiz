export interface MessageData {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type: "text" | "code" | "file" | "system";
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
  isEdited: boolean;
}
