export * from './users.schema';
export * from './agents.schema';
export * from './projects.schema';
export * from './channels.schema';
export * from './messages.schema';
export * from './dm-conversations.schema';
export * from './forum.schema';
export * from './issues.schema';
export * from './relationships.schema';

// Relations (para queries)
import { relations } from 'drizzle-orm';
import { 
  users, agents, projects, channels, messages, 
  dmConversations, forumTopics, forumPosts, 
  issues, issueComments, projectAgents, projectUsers
} from './';

export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects),
  messages: many(messages),
  dmConversations: many(dmConversations),
  createdAgents: many(agents),
  projectMemberships: many(projectUsers),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  channels: many(channels),
  issues: many(issues),
  forumTopics: many(forumTopics),
  agents: many(projectAgents),
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

export const dmConversationsRelations = relations(dmConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [dmConversations.userId],
    references: [users.id],
  }),
  agent: one(agents, {
    fields: [dmConversations.agentId],
    references: [agents.id],
  }),
  messages: many(messages),
}));

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