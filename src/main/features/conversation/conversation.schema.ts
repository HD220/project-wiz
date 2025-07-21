import { z } from "zod";

// Conversation Types
export const ConversationTypeSchema = z.enum(["dm", "agent_chat"]);

export const LlmRoleSchema = z.enum(["user", "assistant", "system", "tool"]);

// Basic Conversation Schemas
export const CreateConversationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: ConversationTypeSchema.default("dm"),
  agentId: z.string().uuid().optional(),
  participantIds: z.array(z.string().uuid()).min(1, "At least one participant is required"),
});

export const UpdateConversationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional(),
  type: ConversationTypeSchema.optional(),
  agentId: z.string().uuid().optional(),
});

// Conversation Participant Schemas
export const AddParticipantSchema = z.object({
  conversationId: z.string().uuid(),
  participantId: z.string().uuid(),
});

export const RemoveParticipantSchema = z.object({
  conversationId: z.string().uuid(),
  participantId: z.string().uuid(),
});

// Message Schemas
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  authorId: z.string().uuid(),
  content: z.string().min(1, "Message content cannot be empty").max(10000, "Message too long"),
});

export const UpdateMessageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, "Message content cannot be empty").max(10000, "Message too long"),
});

// LLM Message Schemas
export const LlmMessageDataSchema = z.object({
  role: LlmRoleSchema,
  toolCalls: z.string().optional(),
  metadata: z.string().optional(),
});

export const SendLlmMessageSchema = z.object({
  messageInput: SendMessageSchema,
  llmData: LlmMessageDataSchema,
});

// Agent Chat Schemas
export const SendAgentMessageSchema = z.object({
  agentId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string().min(1, "Message content cannot be empty").max(10000, "Message too long"),
});

// Query Filter Schemas
export const ConversationFiltersSchema = z.object({
  type: ConversationTypeSchema.optional(),
  agentId: z.string().uuid().optional(),
  participantId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export const MessageFiltersSchema = z.object({
  conversationId: z.string().uuid().optional(),
  authorId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// Get Conversation Schemas
export const GetConversationSchema = z.object({
  conversationId: z.string().uuid(),
});

export const GetUserConversationsSchema = z.object({
  userId: z.string().uuid(),
});

export const GetAgentConversationSchema = z.object({
  userId: z.string().uuid(),
  agentId: z.string().uuid(),
});

export const GetConversationMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().min(0).optional(),
});

// Validation helpers
export const validateCreateConversation = (data: unknown) => 
  CreateConversationSchema.parse(data);

export const validateSendMessage = (data: unknown) => 
  SendMessageSchema.parse(data);

export const validateSendAgentMessage = (data: unknown) => 
  SendAgentMessageSchema.parse(data);

export const validateConversationFilters = (data: unknown) => 
  ConversationFiltersSchema.parse(data);

export const validateMessageFilters = (data: unknown) => 
  MessageFiltersSchema.parse(data);

// Type exports for use in services and handlers
export type CreateConversationInput = z.infer<typeof CreateConversationSchema>;
export type UpdateConversationInput = z.infer<typeof UpdateConversationSchema>;
export type AddParticipantInput = z.infer<typeof AddParticipantSchema>;
export type RemoveParticipantInput = z.infer<typeof RemoveParticipantSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type UpdateMessageInput = z.infer<typeof UpdateMessageSchema>;
export type LlmMessageDataInput = z.infer<typeof LlmMessageDataSchema>;
export type SendLlmMessageInput = z.infer<typeof SendLlmMessageSchema>;
export type SendAgentMessageInput = z.infer<typeof SendAgentMessageSchema>;
export type ConversationFiltersInput = z.infer<typeof ConversationFiltersSchema>;
export type MessageFiltersInput = z.infer<typeof MessageFiltersSchema>;
export type GetConversationInput = z.infer<typeof GetConversationSchema>;
export type GetUserConversationsInput = z.infer<typeof GetUserConversationsSchema>;
export type GetAgentConversationInput = z.infer<typeof GetAgentConversationSchema>;
export type GetConversationMessagesInput = z.infer<typeof GetConversationMessagesSchema>;