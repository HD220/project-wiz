import { EntityCreatedEvent } from "./entity-created.event";

export class MessageSentEvent extends EntityCreatedEvent {
  type = "message.sent" as const;

  constructor(
    messageId: string,
    message: {
      content: string;
      senderId: string;
      senderName: string;
      senderType: "user" | "agent" | "system";
      conversationId?: string;
      channelId?: string;
    },
  ) {
    super(messageId, "message", message);
  }
}
