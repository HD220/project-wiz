export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: "user" | "agent" | "system";
  messageType: "text" | "task_update" | "system" | "file_share" | "code";
  timestamp: Date;
  isEdited?: boolean;
  replyTo?: string;
  mentions?: string[];
  attachments?: unknown[];
  metadata?: Record<string, unknown>;
}

export interface MessageItemProps {
  message: Message;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  showActions?: boolean;
}
