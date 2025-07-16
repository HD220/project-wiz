// Use centralized message types instead of duplicating
import type { DirectMessage, BaseMessage } from "@/shared/types/domains/common";

// Re-export centralized direct message type
export type MessageDto = DirectMessage;
