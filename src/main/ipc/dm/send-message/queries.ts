import { z } from "zod";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  messagesTable,
  type SelectMessage 
} from "@/main/database/schemas/message.schema";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const { getDatabase } = createDatabaseConnection(true);
const logger = getLogger("dm.send-message.model");

// Input validation schema
export const SendDMMessageInputSchema = z.object({
  dmId: z.string().min(1, "DM ID is required"),
  authorId: z.string().min(1, "Author ID is required"),
  content: z.string().min(1, "Message content is required"),
});

// Output validation schema baseado em SelectMessage
export const SendDMMessageOutputSchema = z.object({
  id: z.string(),
  sourceType: z.enum(["dm", "channel"]),
  sourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type SendDMMessageInput = z.infer<typeof SendDMMessageInputSchema>;
export type SendDMMessageOutput = z.infer<typeof SendDMMessageOutputSchema>;

// Função para emitir evento de mensagem (replicando do messageService)
async function emitUserMessageEvent(message: SelectMessage, sourceType: string): Promise<void> {
  try {
    await eventBus.emit("user-sent-message", {
      message,
      sourceType,
      sourceId: message.sourceId,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error("❌ Failed to emit user message event:", error);
  }
}

export async function sendDMMessage(input: SendDMMessageInput): Promise<SendDMMessageOutput> {
  const db = getDatabase();
  
  const validatedInput = SendDMMessageInputSchema.parse(input);

  // 1. Enviar mensagem para DM (replicando messageService.sendToDM)
  const [message] = await db
    .insert(messagesTable)
    .values({
      sourceType: "dm",
      sourceId: validatedInput.dmId,
      authorId: validatedInput.authorId,
      content: validatedInput.content,
    })
    .returning();

  if (!message) {
    throw new Error("Failed to send message");
  }

  // 2. Emitir evento user-sent-message
  try {
    await emitUserMessageEvent(message, "dm");
  } catch (error) {
    logger.error("❌ Failed to emit user message event:", error);
    // Não falhar o envio da mensagem por causa do evento
  }

  return SendDMMessageOutputSchema.parse(message);
}