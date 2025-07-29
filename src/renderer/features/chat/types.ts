// ===========================
// CHAT FEATURE TYPES - MODULAR
// ===========================

// Base message structure for chat components
export type ChatMessage = {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  isActive: boolean;
};

// Chat participant information
export type ChatParticipant = {
  id: string;
  name: string;
  avatar?: string;
  type: "human" | "agent";
};

// Chat context data shared between compound components
export type ChatContextData = {
  sourceType: "dm" | "channel";
  sourceId: string;
  isArchived: boolean;
  onSendMessage: (content: string) => Promise<void>;
};

// Message context data for Message compound component
export type MessageContextData = {
  message: ChatMessage;
  author: ChatParticipant;
  isCurrentUser: boolean;
  showAvatar: boolean;
};

// Message grouping for display
export type MessageGroup = {
  id: string;
  authorId: string;
  messages: ChatMessage[];
  showAvatar: boolean;
};
