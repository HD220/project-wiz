import {
  conversations,
  type ConversationSchema,
  type CreateConversationSchema,
} from "../conversations.schema";
import {
  messages,
  messagesRelations,
  type MessageSchema,
  type CreateMessageSchema,
} from "../messages.schema";
import { users, type UserSchema, type CreateUserSchema } from "../users.schema";

export {
  users,
  type UserSchema,
  type CreateUserSchema,
  conversations,
  type ConversationSchema,
  type CreateConversationSchema,
  messages,
  messagesRelations,
  type MessageSchema,
  type CreateMessageSchema,
};
