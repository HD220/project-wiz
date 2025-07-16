// Use centralized message types instead of duplicating
import type {
  FormattedMessage as BaseFormattedMessage,
  Message,
} from "@/shared/types/domains/common";

// Re-export centralized types
export type { Message, FormattedMessage } from "@/shared/types/domains/common";

export interface MessageItemProps {
  message: FormattedMessage;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  showActions?: boolean;
}
