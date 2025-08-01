import { EventEmitter } from "events";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("event-bus");

// System event type definitions
export interface SystemEvents {
  "user-sent-message": {
    messageId: string;
    conversationId: string;
    conversationType: "dm" | "channel";
    authorId: string;
    content: string;
    timestamp: Date;
  };
  "agent-status-changed": {
    agentId: string;
    oldStatus: string;
    newStatus: string;
    conversationId?: string;
    timestamp: Date;
  };
  "conversation-updated": {
    conversationId: string;
    conversationType: "dm" | "channel";
    updateType: "message-added" | "agent-response" | "status-changed";
    data?: any;
    timestamp: Date;
  };
}

export type SystemEventName = keyof SystemEvents;
export type SystemEventData<T extends SystemEventName> = SystemEvents[T];

/**
 * Type-safe Event Bus extending Node.js EventEmitter
 * Provides centralized event coordination for the AI integration system
 */
export class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for complex event flows
    logger.info("🔄 EventBus initialized");
  }

  /**
   * Type-safe event emission
   */
  emit<T extends SystemEventName>(
    eventName: T,
    data: SystemEventData<T>
  ): boolean {
    logger.debug(`📤 Emitting event: ${eventName}`, data);
    return super.emit(eventName, data);
  }

  /**
   * Type-safe event listener registration
   */
  on<T extends SystemEventName>(
    eventName: T,
    listener: (data: SystemEventData<T>) => void
  ): this {
    logger.debug(`👂 Registering listener for: ${eventName}`);
    return super.on(eventName, listener);
  }

  /**
   * Type-safe one-time event listener registration
   */
  once<T extends SystemEventName>(
    eventName: T,
    listener: (data: SystemEventData<T>) => void
  ): this {
    logger.debug(`👂 Registering one-time listener for: ${eventName}`);
    return super.once(eventName, listener);
  }

  /**
   * Remove all listeners for a specific event
   */
  removeAllListeners<T extends SystemEventName>(eventName?: T): this {
    if (eventName) {
      logger.debug(`🗑️ Removing all listeners for: ${eventName}`);
    } else {
      logger.debug("🗑️ Removing all listeners");
    }
    return super.removeAllListeners(eventName);
  }

  /**
   * Get listener count for debugging
   */
  getEventListenerCount<T extends SystemEventName>(eventName: T): number {
    return this.listenerCount(eventName);
  }

  /**
   * Graceful shutdown - remove all listeners
   */
  shutdown(): void {
    logger.info("🛑 EventBus shutting down, removing all listeners");
    this.removeAllListeners();
  }
}

// Global singleton instance
export const eventBus = new EventBus();

// Export singleton initialization function for explicit setup
export function initializeEventBus(): EventBus {
  logger.info("🚀 EventBus singleton initialized");
  return eventBus;
}