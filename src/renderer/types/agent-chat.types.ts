export interface AgentData {
  id: string;
  name: string;
  role: string;
  backstory: string;
  goal: string;
  systemPrompt: string;
  status: "active" | "inactive" | "busy";
  modelConfig: string;
  userId: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageData {
  id: string;
  conversationId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationData {
  id: string;
  name?: string;
  description?: string;
  type: "dm" | "agent_chat";
  agentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendAgentMessageInput {
  agentId: string;
  userId: string;
  content: string;
}

export interface AgentChatResponse {
  content: string;
  conversationId: string;
  userMessageId: string;
  agentMessageId: string;
}

export interface ConversationWithMessages {
  conversation: ConversationData;
  messages: MessageData[];
}
