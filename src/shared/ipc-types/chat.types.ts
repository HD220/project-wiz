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

// Direct Messages
export type GetDMConversationsListRequest = void;
export type GetDMConversationsListResponse = DirectMessageItem[];

export type GetDMDetailsRequest = { dmId: string };
export type GetDMDetailsResponse = DirectMessageItem | null;

export type GetDMMessagesRequest = { conversationId: string };
export type GetDMMessagesResponse = ChatMessage[];

export type SendDMMessageRequest = { dmId: string; content: string; senderId: string };
export type SendDMMessageResponse = ChatMessage;

export type DMMessageReceivedEventPayload = {
  conversationId: string;
  message: ChatMessage;
};
export type DMConversationsUpdatedEventPayload = DirectMessageItem[];


