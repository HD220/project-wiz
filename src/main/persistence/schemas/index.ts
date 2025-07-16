// Central export file for all database schemas
// This is the single source of truth for Drizzle schemas

// Import individual schemas

import {
  agents,
  type AgentSchema,
  type CreateAgentSchema,
} from "./agents.schema";
import {
  channelMessages,
  channelMessagesRelations,
  type ChannelMessageSchema,
  type CreateChannelMessageSchema,
} from "./channel-messages.schema";
import {
  channels,
  channelsRelations,
  type ChannelSchema,
  type CreateChannelSchema,
} from "./channels.schema";
import {
  conversations,
  type ConversationSchema,
  type CreateConversationSchema,
} from "./conversations.schema";
import {
  llmProviders,
  type LlmProviderSchema,
  type CreateLlmProviderSchema,
} from "./llm-providers.schema";
import {
  messages,
  messagesRelations,
  type MessageSchema,
  type CreateMessageSchema,
} from "./messages.schema";
import {
  projects,
  type ProjectSchema,
  type CreateProjectSchema,
} from "./projects.schema";
import { users, type UserSchema, type CreateUserSchema } from "./users.schema";

// Re-export everything
export {
  projects,
  type ProjectSchema,
  type CreateProjectSchema,
  agents,
  type AgentSchema,
  type CreateAgentSchema,
  llmProviders,
  type LlmProviderSchema,
  type CreateLlmProviderSchema,
  channels,
  channelsRelations,
  type ChannelSchema,
  type CreateChannelSchema,
  channelMessages,
  channelMessagesRelations,
  type ChannelMessageSchema,
  type CreateChannelMessageSchema,
  conversations,
  type ConversationSchema,
  type CreateConversationSchema,
  messages,
  messagesRelations,
  type MessageSchema,
  type CreateMessageSchema,
  users,
  type UserSchema,
  type CreateUserSchema,
};

// Export all tables for Drizzle migrations
export const allTables = {
  projects,
  agents,
  llmProviders,
  channels,
  channelMessages,
  conversations,
  messages,
  users,
};

// Export all relations for Drizzle
export const allRelations = {
  channelsRelations,
  channelMessagesRelations,
  messagesRelations,
};
