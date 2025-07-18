import { eq, and, desc, lt } from "drizzle-orm";
import { getDatabase } from "../../database/connection";
import { messages } from "./messages.schema";
import { dmConversations } from "../../user/direct-messages/dm-conversations.schema";
import { channels } from "../../project/channels/channels.schema";
import { z } from "zod";

// Simple ID generator
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple validation schemas
const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  contentType: z.enum(["text", "image", "file", "code"]).default("text"),
  messageType: z
    .enum(["text", "system", "task_result", "notification"])
    .default("text"),
  channelId: z.string().optional(),
  dmConversationId: z.string().optional(),
  replyToId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

/**
 * Send message (user or agent)
 * KISS approach: Simple function that handles both user and agent messages
 */
export async function sendMessage(
  input: SendMessageInput,
  authorId: string,
  authorType: "user" | "agent" = "user",
): Promise<any> {
  // 1. Validate input
  const validated = SendMessageSchema.parse(input);

  // 2. Validate access
  if (validated.channelId && validated.dmConversationId) {
    throw new Error("Cannot specify both channelId and dmConversationId");
  }

  if (!validated.channelId && !validated.dmConversationId) {
    throw new Error("Must specify either channelId or dmConversationId");
  }

  if (validated.channelId) {
    await validateChannelAccess(validated.channelId, authorId, authorType);
  }

  if (validated.dmConversationId) {
    await validateDMAccess(validated.dmConversationId, authorId, authorType);
  }

  // 3. Create message
  const db = getDatabase();
  const messageId = generateId();
  const now = new Date();

  const newMessage = {
    id: messageId,
    content: validated.content,
    contentType: validated.contentType,
    messageType: validated.messageType,
    channelId: validated.channelId,
    dmConversationId: validated.dmConversationId,
    authorId,
    authorType,
    replyToId: validated.replyToId,
    metadata: validated.metadata ? JSON.stringify(validated.metadata) : null,
    createdAt: now,
  };

  await db.insert(messages).values(newMessage);

  // 4. Update DM conversation if needed
  if (validated.dmConversationId) {
    await updateDMLastMessage(validated.dmConversationId);
  }

  // 5. TODO: Process message for agent actions

  return newMessage;
}

/**
 * Get messages from channel
 */
export async function getChannelMessages(
  channelId: string,
  options: { limit?: number; before?: string } = {},
): Promise<any[]> {
  const db = getDatabase();
  const { limit = 50, before } = options;

  const messagesList = await db.query.messages.findMany({
    where: and(
      eq(messages.channelId, channelId),
      before ? lt(messages.createdAt, new Date(before)) : undefined,
    ),
    orderBy: [desc(messages.createdAt)],
    limit,
  });

  // Return in chronological order
  return messagesList.reverse().map((msg) => ({
    ...msg,
    metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
  }));
}

/**
 * Get messages from DM conversation
 */
export async function getDMMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {},
): Promise<any[]> {
  const db = getDatabase();
  const { limit = 50, before } = options;

  const messagesList = await db.query.messages.findMany({
    where: and(
      eq(messages.dmConversationId, conversationId),
      before ? lt(messages.createdAt, new Date(before)) : undefined,
    ),
    orderBy: [desc(messages.createdAt)],
    limit,
  });

  return messagesList.reverse().map((msg) => ({
    ...msg,
    metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
  }));
}

/**
 * Get or create DM conversation between user and agent
 */
export async function getOrCreateDMConversation(
  userId: string,
  agentId: string,
): Promise<string> {
  const db = getDatabase();

  // Try to find existing conversation
  const existing = await db.query.dmConversations.findFirst({
    where: and(
      eq(dmConversations.userId, userId),
      eq(dmConversations.agentId, agentId),
      eq(dmConversations.isActive, true),
    ),
  });

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  const conversationId = generateId();
  const now = new Date();

  const newConversation = {
    id: conversationId,
    userId,
    agentId,
    isActive: true,
    isPinned: false,
    unreadCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(dmConversations).values(newConversation);

  return conversationId;
}

/**
 * Get user's DM conversations
 */
export async function getUserDMConversations(userId: string): Promise<any[]> {
  const db = getDatabase();

  const conversations = await db.query.dmConversations.findMany({
    where: and(
      eq(dmConversations.userId, userId),
      eq(dmConversations.isActive, true),
    ),
    with: {
      agent: true,
    },
    orderBy: [desc(dmConversations.lastMessageAt)],
  });

  return conversations.map((conv) => ({
    ...conv,
    agent: {
      ...(conv.agent as any),
      expertise: (conv.agent as any).expertise
        ? JSON.parse((conv.agent as any).expertise)
        : [],
    },
  }));
}

/**
 * Mark DM conversation as read
 */
export async function markDMAsRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  await db
    .update(dmConversations)
    .set({
      lastReadAt: new Date(),
      unreadCount: 0,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dmConversations.id, conversationId),
        eq(dmConversations.userId, userId),
      ),
    );
}

/**
 * Get channel info
 */
export async function getChannelInfo(channelId: string): Promise<any | null> {
  const db = getDatabase();

  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, channelId),
    with: {
      project: true,
    },
  });

  if (!channel) return null;

  return {
    ...channel,
    permissions: channel.permissions ? JSON.parse(channel.permissions) : null,
  };
}

// Helper functions

async function validateChannelAccess(
  channelId: string,
  _authorId: string,
  _authorType: "user" | "agent",
): Promise<void> {
  const channel = await getChannelInfo(channelId);

  if (!channel) {
    throw new Error("Channel not found");
  }

  // For now, simple validation - just check if channel exists
  // TODO: Implement proper permission system
}

async function validateDMAccess(
  conversationId: string,
  authorId: string,
  authorType: "user" | "agent",
): Promise<void> {
  const db = getDatabase();

  const conversation = await db.query.dmConversations.findFirst({
    where: eq(dmConversations.id, conversationId),
  });

  if (!conversation) {
    throw new Error("DM conversation not found");
  }

  // Check if author is participant
  if (authorType === "user" && conversation.userId !== authorId) {
    throw new Error("No access to this conversation");
  }

  if (authorType === "agent" && conversation.agentId !== authorId) {
    throw new Error("No access to this conversation");
  }
}

async function updateDMLastMessage(conversationId: string): Promise<void> {
  const db = getDatabase();

  await db
    .update(dmConversations)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(dmConversations.id, conversationId));
}

/**
 * Update message content
 */
export async function updateMessage(
  messageId: string,
  content: string,
  userId: string,
): Promise<any> {
  const db = getDatabase();

  // Check if message exists and belongs to user
  const message = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!message.length) {
    throw new Error("Message not found");
  }

  if (message[0]!.authorId !== userId || message[0]!.authorType !== "user") {
    throw new Error("Not authorized to update this message");
  }

  // Update message
  await db
    .update(messages)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));

  return { ...message[0]!, content, updatedAt: new Date() };
}

/**
 * Delete message
 */
export async function deleteMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const db = getDatabase();

  // Check if message exists and belongs to user
  const message = await db
    .select()
    .from(messages)
    .where(eq(messages.id, messageId))
    .limit(1);

  if (!message.length) {
    throw new Error("Message not found");
  }

  if (message[0]!.authorId !== userId || message[0]!.authorType !== "user") {
    throw new Error("Not authorized to delete this message");
  }

  // Soft delete
  await db
    .update(messages)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(messages.id, messageId));
}
