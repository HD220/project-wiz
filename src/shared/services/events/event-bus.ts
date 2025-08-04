import { EventEmitter } from "events";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("event-bus");

/**
 * Generic type-safe Event Bus extending Node.js EventEmitter
 * Provides centralized event coordination with flexible event types
 */
export class EventBus<TEvents extends Record<string, any> = Record<string, any>> extends EventEmitter {
  constructor() {
    super();
    logger.info("🔄 EventBus initialized");
  }

  /**
   * Type-safe event emission
   */
  emit<T extends keyof TEvents>(
    eventName: T,
    data: TEvents[T]
  ): boolean {
    logger.debug(`📤 Emitting event: ${String(eventName)}`, data);
    return super.emit(eventName as string, data);
  }

  /**
   * Type-safe event listener registration
   */
  on<T extends keyof TEvents>(
    eventName: T,
    listener: (data: TEvents[T]) => void
  ): this {
    logger.debug(`👂 Registering listener for: ${String(eventName)}`);
    return super.on(eventName as string, listener);
  }

  /**
   * Type-safe one-time event listener registration
   */
  once<T extends keyof TEvents>(
    eventName: T,
    listener: (data: TEvents[T]) => void
  ): this {
    logger.debug(`👂 Registering one-time listener for: ${String(eventName)}`);
    return super.once(eventName as string, listener);
  }

  /**
   * Remove all listeners for a specific event
   */
  removeAllListeners<T extends keyof TEvents>(eventName?: T): this {
    if (eventName) {
      logger.debug(`🗑️ Removing all listeners for: ${String(eventName)}`);
    } else {
      logger.debug("🗑️ Removing all listeners");
    }
    return super.removeAllListeners(eventName as string);
  }

  /**
   * Get listener count for debugging
   */
  getEventListenerCount<T extends keyof TEvents>(eventName: T): number {
    return this.listenerCount(eventName as string);
  }

  /**
   * Graceful shutdown - remove all listeners
   */
  shutdown(): void {
    logger.info("🛑 EventBus shutting down, removing all listeners");
    this.removeAllListeners();
  }
}

// Global singleton instance - can be typed with specific event interface when needed
export const eventBus = new EventBus();

// Export singleton initialization function for explicit setup
export function initializeEventBus(): EventBus {
  logger.info("🚀 EventBus singleton initialized");
  return eventBus;
}

// Helper function to create typed event bus instances
export function createEventBus<TEvents extends Record<string, any>>(): EventBus<TEvents> {
  return new EventBus<TEvents>();
}