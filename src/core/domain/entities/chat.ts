export interface ChatMessageSender {
  id: string;
  name: string;
  type: "user" | "agent";
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatMessageSender;
  content: string;
  timestamp: string | Date;
  type?: "text" | "tool_call" | "tool_response" | "error" | "system";
  isContinuation?: boolean;
}

export interface DirectMessageItem {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  type: "dm" | "agent";
  participantIds?: string[];
}
