// Central export file for all database schemas
// This is the single source of truth for Drizzle schemas

export * from "./core/projects.exports";
export * from "./core/agents.exports";
export * from "./core/users.exports";
export * from "./core/channels.exports";
export * from "./core/llm.exports";

// Import for collections
import { agents } from "./core/agents.exports";
import {
  channels,
  channelMessages,
  channelsRelations,
  channelMessagesRelations,
} from "./core/channels.exports";
import { llmProviders } from "./core/llm.exports";
import { projects } from "./core/projects.exports";
import {
  users,
  conversations,
  messages,
  messagesRelations,
} from "./core/users.exports";

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
