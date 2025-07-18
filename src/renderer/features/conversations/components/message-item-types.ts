// Use centralized message types instead of duplicating

// Re-export centralized types
export type { FormattedMessage, Message } from "@/shared/types/common";

export interface MessageItemProps {
  message: FormattedMessage;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  showActions?: boolean;
}
