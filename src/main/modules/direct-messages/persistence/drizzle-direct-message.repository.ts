import { and, or, eq } from "drizzle-orm";

import { DirectMessage } from "@/main/modules/direct-messages/domain/direct-message.entity";
import { IDirectMessageRepository } from "@/main/modules/direct-messages/domain/direct-message.repository";
import { db } from "@/main/persistence/db";

import { directMessages } from "./schema";

export class DrizzleDirectMessageRepository implements IDirectMessageRepository {
  async save(message: DirectMessage): Promise<DirectMessage> {
    try {
      await db.insert(directMessages).values({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.timestamp,
      });
      return message;
    } catch (error: unknown) {
      console.error("Failed to save direct message:", error);
      throw new Error(`Failed to save direct message: ${(error as Error).message}`);
    }
  }

  async findByConversation(senderId: string, receiverId: string): Promise<DirectMessage[]> {
    try {
      const results = await db.select().from(directMessages).where(
        or(
          and(eq(directMessages.senderId, senderId), eq(directMessages.receiverId, receiverId)),
          and(eq(directMessages.senderId, receiverId), eq(directMessages.receiverId, senderId))
        )
      ).orderBy(directMessages.timestamp);

      return results.map(data => new DirectMessage(data, data.id));
    } catch (error: unknown) {
      console.error("Failed to find direct messages by conversation:", error);
      throw new Error(`Failed to find direct messages by conversation: ${(error as Error).message}`);
    }
  }
}
