import { eq, and, asc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  messagesTable,
  type SelectMessage 
} from "@/main/database/schemas/message.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getDMMessages(dmId: string, options?: { limit?: number }): Promise<SelectMessage[]> {
  const db = getDatabase();

  const conditions = [
    eq(messagesTable.sourceType, "dm"),
    eq(messagesTable.sourceId, dmId),
    eq(messagesTable.isActive, true),
  ];

  let query = db
    .select()
    .from(messagesTable)
    .where(and(...conditions))
    .orderBy(asc(messagesTable.createdAt));

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const messages = await query;
  return messages;
}