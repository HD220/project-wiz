import { randomBytes } from 'crypto';

/**
 * Generate a unique ID using crypto.randomBytes
 * Returns a URL-safe base64 string
 */
export function generateId(): string {
  // Generate 16 random bytes and convert to base64
  const buffer = randomBytes(16);
  return buffer.toString('base64url');
}

/**
 * Generate a prefixed ID with a specific prefix
 * Useful for distinguishing entity types
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${generateId()}`;
}

/**
 * Generate specific entity IDs
 */
export const generateUserId = () => generatePrefixedId('user');
export const generateAgentId = () => generatePrefixedId('agent');
export const generateProjectId = () => generatePrefixedId('project');
export const generateChannelId = () => generatePrefixedId('channel');
export const generateMessageId = () => generatePrefixedId('msg');
export const generateConversationId = () => generatePrefixedId('conv');
export const generateTopicId = () => generatePrefixedId('topic');
export const generatePostId = () => generatePrefixedId('post');
export const generateIssueId = () => generatePrefixedId('issue');
export const generateCommentId = () => generatePrefixedId('comment');