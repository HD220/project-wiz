import { EntityCreatedEvent } from "./entity-created.event";

export class AIChatMessageGeneratedEvent extends EntityCreatedEvent {
  type = "ai.message.generated" as const;

  constructor(
    messageId: string,
    aiMessage: {
      agentId: string;
      agentName: string;
      content: string;
      channelId?: string;
      conversationId?: string;
    },
  ) {
    super(messageId, "ai-message", aiMessage);
  }
}
