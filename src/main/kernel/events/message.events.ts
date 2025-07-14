import { EntityCreatedEvent, EntityUpdatedEvent } from "./base.events";

// Message Events
export class MessageSentEvent extends EntityCreatedEvent {
  type = "message.sent" as const;

  constructor(
    messageId: string,
    public readonly message: {
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

// Conversation Events
export class ConversationStartedEvent extends EntityCreatedEvent {
  type = "conversation.started" as const;

  constructor(
    conversationId: string,
    public readonly participants: string[],
  ) {
    super(conversationId, "conversation", { participants });
  }
}

// Channel Events
export class ChannelCreatedEvent extends EntityCreatedEvent {
  type = "channel.created" as const;

  constructor(
    channelId: string,
    public readonly channel: {
      name: string;
      projectId: string;
      createdBy: string;
      description?: string;
      isPrivate: boolean;
    },
  ) {
    super(channelId, "channel", channel);
  }
}

// AI Chat Events
export class AIChatMessageGeneratedEvent extends EntityCreatedEvent {
  type = "ai.message.generated" as const;

  constructor(
    messageId: string,
    public readonly aiMessage: {
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
