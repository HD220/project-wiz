export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface HistoryRepositoryPort {
  getAllConversations(): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | null>;
  createConversation(title?: string): Promise<Conversation>;
  updateConversationTitle(id: string, newTitle: string): Promise<void>;
  deleteConversation(id: string): Promise<void>;

  getMessages(conversationId: string): Promise<Message[]>;
  addMessage(conversationId: string, message: Message): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
}