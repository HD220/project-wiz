import { EntityCreatedEvent } from "./entity-created.event";

export class ConversationStartedEvent extends EntityCreatedEvent {
  type = "conversation.started" as const;

  constructor(conversationId: string, participants: string[]) {
    super(conversationId, "conversation", {
      participantsCount: participants.length,
    });
  }
}
