// Central export file for all database schemas
// This is the single source of truth for Drizzle schemas

// Projects
export {
  projects,
  type ProjectSchema,
  type CreateProjectSchema
} from './projects.schema';

// Agents (formerly personas)
export {
  agents,
  type AgentSchema,
  type CreateAgentSchema
} from './agents.schema';

// LLM Providers
export {
  llmProviders,
  type LlmProviderSchema,
  type CreateLlmProviderSchema
} from './llm-providers.schema';

// Communication - Channels
export {
  channels,
  channelsRelations,
  type ChannelSchema,
  type CreateChannelSchema
} from './channels.schema';

// Channel Messages
export {
  channelMessages,
  channelMessagesRelations,
  type ChannelMessageSchema,
  type CreateChannelMessageSchema
} from './channel-messages.schema';

// Direct Messages - Conversations
export {
  conversations,
  type ConversationSchema,
  type CreateConversationSchema
} from './conversations.schema';

// Direct Messages - Messages
export {
  messages,
  messagesRelations,
  type MessageSchema,
  type CreateMessageSchema
} from './messages.schema';

// Export all tables for Drizzle migrations
export const allTables = {
  projects,
  agents,
  llmProviders,
  channels,
  channelMessages,
  conversations,
  messages,
};

// Export all relations for Drizzle
export const allRelations = {
  channelsRelations,
  channelMessagesRelations,
  messagesRelations,
};