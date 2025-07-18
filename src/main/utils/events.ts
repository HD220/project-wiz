import { EventEmitter } from "events";
import { getLogger } from "./logger";

const logger = getLogger("events");

// Domain event types
export type DomainEvent =
  // User events
  | { type: "user.created"; data: { userId: string; username: string } }
  | { type: "user.updated"; data: { userId: string } }
  | { type: "user.deactivated"; data: { userId: string } }
  | {
      type: "user.preferences.updated";
      data: { userId: string; preferences: Record<string, any> };
    }

  // Project events
  | {
      type: "project.created";
      data: { projectId: string; name: string; ownerId: string };
    }
  | { type: "project.updated"; data: { projectId: string; name: string } }
  | { type: "project.archived"; data: { projectId: string } }
  | { type: "project.deleted"; data: { projectId: string } }

  // Agent events
  | {
      type: "agent.created";
      data: { agentId: string; name: string; role: string; createdBy: string };
    }
  | { type: "agent.updated"; data: { agentId: string } }
  | { type: "agent.status_changed"; data: { agentId: string; status: string } }
  | {
      type: "agent.added_to_project";
      data: { agentId: string; projectId: string; role: string };
    }
  | {
      type: "agent.removed_from_project";
      data: { agentId: string; projectId: string };
    }

  // Message events
  | {
      type: "message.sent";
      data: {
        messageId: string;
        channelId?: string;
        dmConversationId?: string;
        authorId: string;
        authorType: string;
      };
    }
  | { type: "message.edited"; data: { messageId: string; content: string } }
  | { type: "message.deleted"; data: { messageId: string } }

  // Channel events
  | {
      type: "channel.created";
      data: { channelId: string; projectId: string; name: string };
    }
  | { type: "channel.updated"; data: { channelId: string } }
  | { type: "channel.deleted"; data: { channelId: string } }

  // Issue events
  | {
      type: "issue.created";
      data: { issueId: string; projectId: string; title: string };
    }
  | { type: "issue.updated"; data: { issueId: string } }
  | {
      type: "issue.status_changed";
      data: { issueId: string; oldStatus: string; newStatus: string };
    }
  | {
      type: "issue.assigned";
      data: { issueId: string; assigneeId: string; assigneeType: string };
    }
  | { type: "issue.completed"; data: { issueId: string } };

// Create a singleton event bus
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100); // Increase max listeners for a busy application
  }

  publish<T extends DomainEvent["type"]>(
    eventType: T,
    data: Extract<DomainEvent, { type: T }>["data"],
  ): void {
    logger.debug({ eventType, data }, "Publishing event");
    this.emit(eventType, data);
  }

  subscribe<T extends DomainEvent["type"]>(
    eventType: T,
    handler: (
      data: Extract<DomainEvent, { type: T }>["data"],
    ) => void | Promise<void>,
  ): () => void {
    logger.debug({ eventType }, "Subscribing to event");

    const wrappedHandler = async (data: any) => {
      try {
        await handler(data);
      } catch (error) {
        logger.error({ error, eventType, data }, "Error handling event");
      }
    };

    this.on(eventType, wrappedHandler);

    // Return unsubscribe function
    return () => {
      this.off(eventType, wrappedHandler);
    };
  }
}

// Export singleton instance
const eventBus = new EventBus();

// Export convenience functions (simplified for type safety)
export function publishEvent(eventType: DomainEvent["type"], data: any): void {
  eventBus.publish(eventType as any, data);
}

export function subscribeToEvent(
  eventType: DomainEvent["type"],
  handler: (data: any) => void | Promise<void>,
): () => void {
  return eventBus.subscribe(eventType as any, handler);
}

// Export the event bus for advanced usage
export { eventBus };
