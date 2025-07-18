// Consolidated schema exports following FILE-STRUCTURE.md
// Co-located schemas from bounded contexts

// User bounded context
export * from "../user/authentication/users.schema";
export * from "../conversations/direct-messages/dm-conversations.schema";

// Project bounded context
export * from "../project/projects.schema";
export * from "../project/channels/channels.schema";
export * from "../project/members/project-agents.schema";
export * from "../project/members/project-users.schema";
export * from "../project/issues/issues.schema";
export * from "../project/forums/forums.schema";

// Agents bounded context
export * from "../agents/worker/agents.schema";
export * from "../agents/llm/llm-providers.schema";

// Conversations bounded context
export * from "../conversations/core/messages.schema";

// All schemas are now distributed and organized by bounded context

// Relations (for queries)
import { relations } from "drizzle-orm";
import { users } from "../user/authentication/users.schema";
import { dmConversations } from "../conversations/direct-messages/dm-conversations.schema";
import { agents } from "../agents/worker/agents.schema";
import { llmProviders } from "../agents/llm/llm-providers.schema";
import { projects } from "../project/projects.schema";
import { channels } from "../project/channels/channels.schema";
import { projectAgents } from "../project/members/project-agents.schema";
import { projectUsers } from "../project/members/project-users.schema";
import { messages } from "../conversations/core/messages.schema";
import {
  issues,
  issueComments,
  issueActivities,
} from "../project/issues/issues.schema";
import { forumTopics, forumPosts } from "../project/forums/forums.schema";

export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  messages: many(messages),
  dmConversations: many(dmConversations),
  createdAgents: many(agents),
  llmProviders: many(llmProviders),
  projectMemberships: many(projectUsers),
  issueComments: many(issueComments),
  forumPosts: many(forumPosts),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  channels: many(channels),
  agents: many(projectAgents),
  issues: many(issues),
  forumTopics: many(forumTopics),
  members: many(projectUsers),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(users, {
    fields: [agents.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
  projects: many(projectAgents),
  dmConversations: many(dmConversations),
}));

export const channelsRelations = relations(channels, ({ one, many }) => ({
  project: one(projects, {
    fields: [channels.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [channels.createdBy],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  dmConversation: one(dmConversations, {
    fields: [messages.dmConversationId],
    references: [dmConversations.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
}));

export const dmConversationsRelations = relations(
  dmConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [dmConversations.userId],
      references: [users.id],
    }),
    agent: one(agents, {
      fields: [dmConversations.agentId],
      references: [agents.id],
    }),
    messages: many(messages),
  }),
);

export const projectAgentsRelations = relations(projectAgents, ({ one }) => ({
  project: one(projects, {
    fields: [projectAgents.projectId],
    references: [projects.id],
  }),
  agent: one(agents, {
    fields: [projectAgents.agentId],
    references: [agents.id],
  }),
  addedByUser: one(users, {
    fields: [projectAgents.addedBy],
    references: [users.id],
  }),
}));

export const llmProvidersRelations = relations(llmProviders, ({ one }) => ({
  createdBy: one(users, {
    fields: [llmProviders.createdBy],
    references: [users.id],
  }),
}));

// New relations for issues
export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, {
    fields: [issues.projectId],
    references: [projects.id],
  }),
  comments: many(issueComments),
  activities: many(issueActivities),
}));

export const issueCommentsRelations = relations(issueComments, ({ one }) => ({
  issue: one(issues, {
    fields: [issueComments.issueId],
    references: [issues.id],
  }),
}));

export const issueActivitiesRelations = relations(
  issueActivities,
  ({ one }) => ({
    issue: one(issues, {
      fields: [issueActivities.issueId],
      references: [issues.id],
    }),
  }),
);

// New relations for forum
export const forumTopicsRelations = relations(forumTopics, ({ one, many }) => ({
  project: one(projects, {
    fields: [forumTopics.projectId],
    references: [projects.id],
  }),
  posts: many(forumPosts),
}));

export const forumPostsRelations = relations(forumPosts, ({ one }) => ({
  topic: one(forumTopics, {
    fields: [forumPosts.topicId],
    references: [forumTopics.id],
  }),
  replyTo: one(forumPosts, {
    fields: [forumPosts.replyToId],
    references: [forumPosts.id],
  }),
}));

// New relations for project users
export const projectUsersRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}));
