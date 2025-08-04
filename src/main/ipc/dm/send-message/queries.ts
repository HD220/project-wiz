import { createDatabaseConnection } from "@/shared/database/config";
import { 
  messagesTable,
  type InsertMessage,
  type SelectMessage 
} from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function sendDMMessage(data: InsertMessage): Promise<SelectMessage> {
  const db = getDatabase();

  const [message] = await db
    .insert(messagesTable)
    .values(data)
    .returning();

  if (!message) {
    throw new Error("Failed to send message");
  }

  return message;
}