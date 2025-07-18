import { EntityUpdatedEvent } from "./entity-updated.event";

export class MessageEditedEvent extends EntityUpdatedEvent {
  type = "message.edited" as const;

  constructor(messageId: string, newContent: string, originalContent: string) {
    super(
      messageId,
      "message",
      { content: newContent, isEdited: true },
      { content: originalContent },
    );
  }
}
