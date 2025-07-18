import { randomBytes } from "crypto";

/**
 * Generate a unique ID with optional prefix
 * Uses crypto.randomBytes for better uniqueness than Math.random()
 */
export function generateId(prefix?: string): string {
  const randomPart = randomBytes(8).toString("hex"); // 16 char hex string
  const timestamp = Date.now().toString(36); // Base36 timestamp for readability

  const id = `${timestamp}-${randomPart}`;

  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate a short ID (8 characters) for display purposes
 */
export function generateShortId(): string {
  return randomBytes(4).toString("hex");
}

/**
 * Generate specific IDs for each domain
 */
export const generateUserId = () => generateId("user");
export const generateProjectId = () => generateId("project");
export const generateAgentId = () => generateId("agent");
export const generateChannelId = () => generateId("channel");
export const generateMessageId = () => generateId("msg");
export const generateIssueId = () => generateId("issue");
export const generateForumTopicId = () => generateId("topic");
export const generateForumPostId = () => generateId("post");
export const generateConversationId = () => generateId("conv");
