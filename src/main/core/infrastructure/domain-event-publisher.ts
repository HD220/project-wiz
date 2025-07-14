import {
  IDomainEvent,
  IDomainEventBus,
  IDomainEventHandler,
} from "../abstractions/domain-event.type";
import { Logger } from "./logger";
import { EventBus, IEvent } from "./event-bus";
import { Result } from "../abstractions/result.type";

/**
 * Adapter to convert domain events to generic events
 */
export class DomainEventAdapter implements IEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly data: Record<string, unknown>;

  constructor(domainEvent: IDomainEvent) {
    this.id = domainEvent.eventId;
    this.type = domainEvent.eventName;
    this.timestamp = domainEvent.occurredOn;
    this.correlationId = domainEvent.aggregateId;
    this.data = {
      ...domainEvent.data,
      eventId: domainEvent.eventId,
      aggregateId: domainEvent.aggregateId,
      version: domainEvent.version,
    };
  }
}

/**
 * Domain event bus implementation using the generic EventBus
 * Provides domain-specific event publishing and subscription
 */
export class DomainEventBus implements IDomainEventBus {
  private readonly eventBus: EventBus;
  private readonly handlerMap = new Map<
    string,
    IDomainEventHandler<IDomainEvent>[]
  >();
  private readonly logger: Logger;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Publish a domain event
   * @param event - Domain event to publish
   * @returns Promise that resolves when event is published
   */
  public async publish(event: IDomainEvent): Promise<void> {
    try {
      this.logger.debug(
        `DomainEventBus: Publishing domain event: ${event.eventName}`,
        {
          eventId: event.eventId,
          aggregateId: event.aggregateId,
          version: event.version,
        },
      );

      // Convert domain event to generic event
      const genericEvent = new DomainEventAdapter(event);

      // Publish through the generic event bus
      const result = await this.eventBus.publish(genericEvent);

      if (result.isFailure) {
        this.logger.error(
          `DomainEventBus: Failed to publish domain event: ${event.eventName}`,
          result.error,
          {
            eventId: event.eventId,
            aggregateId: event.aggregateId,
          },
        );

        throw result.error;
      }

      this.logger.debug(
        `DomainEventBus: Domain event published successfully: ${event.eventName}`,
        {
          eventId: event.eventId,
          handlerCount: result.value.handlerCount,
          successCount: result.value.successCount,
          failureCount: result.value.failureCount,
        },
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `DomainEventBus: Exception publishing domain event: ${event.eventName}`,
        err,
      );
      throw err;
    }
  }

  /**
   * Publish multiple domain events
   * @param events - Array of domain events to publish
   * @returns Promise that resolves when all events are published
   */
  public async publishAll(events: IDomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    this.logger.debug(
      `DomainEventBus: Publishing ${events.length} domain events`,
      {
        eventTypes: events.map((e) => e.eventName),
      },
    );

    const publishPromises = events.map((event) => this.publish(event));

    try {
      await Promise.all(publishPromises);

      this.logger.debug(
        `DomainEventBus: All ${events.length} domain events published successfully`,
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `DomainEventBus: Failed to publish all domain events`,
        err,
      );
      throw err;
    }
  }

  /**
   * Subscribe to domain events
   * @param handler - Event handler to subscribe
   */
  public subscribe<T extends IDomainEvent>(
    handler: IDomainEventHandler<T>,
  ): void {
    const eventName = handler.getEventName();

    // Store domain event handler
    if (!this.handlerMap.has(eventName)) {
      this.handlerMap.set(eventName, []);
    }

    this.handlerMap
      .get(eventName)!
      .push(handler as IDomainEventHandler<IDomainEvent>);

    // Subscribe to generic event bus with adapter
    this.eventBus.subscribe(
      eventName,
      async (genericEvent: IEvent) => {
        try {
          // Convert back to domain event format
          const domainEvent = this.convertToDomainEvent(genericEvent);
          await handler.handle(domainEvent as T);
        } catch (error) {
          this.logger.error(
            `DomainEventBus: Handler failed for domain event: ${eventName}`,
            error instanceof Error ? error : new Error(String(error)),
            {
              eventId: genericEvent.id,
              handlerType: handler.constructor.name,
            },
          );
        }
      },
      {
        priority: 500, // Medium priority for domain events
      },
    );

    this.logger.debug(
      `DomainEventBus: Subscribed domain event handler: ${eventName}`,
      {
        handlerType: handler.constructor.name,
        totalHandlers: this.handlerMap.get(eventName)!.length,
      },
    );
  }

  /**
   * Unsubscribe from domain events
   * @param handler - Event handler to unsubscribe
   */
  public unsubscribe<T extends IDomainEvent>(
    handler: IDomainEventHandler<T>,
  ): void {
    const eventName = handler.getEventName();
    const handlers = this.handlerMap.get(eventName);

    if (handlers) {
      const index = handlers.indexOf(
        handler as IDomainEventHandler<IDomainEvent>,
      );
      if (index > -1) {
        handlers.splice(index, 1);

        if (handlers.length === 0) {
          this.handlerMap.delete(eventName);
        }

        this.logger.debug(
          `DomainEventBus: Unsubscribed domain event handler: ${eventName}`,
          {
            handlerType: handler.constructor.name,
            remainingHandlers: handlers.length,
          },
        );
      }
    }
  }

  /**
   * Get registered domain event types
   * @returns Array of domain event types
   */
  public getRegisteredEventTypes(): string[] {
    return Array.from(this.handlerMap.keys());
  }

  /**
   * Get number of handlers for a domain event type
   * @param eventName - Domain event name
   * @returns Number of handlers
   */
  public getHandlerCount(eventName: string): number {
    return this.handlerMap.get(eventName)?.length ?? 0;
  }

  /**
   * Get total number of registered handlers
   * @returns Total handler count
   */
  public getTotalHandlerCount(): number {
    let count = 0;
    for (const handlers of this.handlerMap.values()) {
      count += handlers.length;
    }
    return count;
  }

  /**
   * Convert generic event back to domain event format
   * @param genericEvent - Generic event to convert
   * @returns Domain event
   */
  private convertToDomainEvent(genericEvent: IEvent): IDomainEvent {
    return {
      eventId: genericEvent.id,
      eventName: genericEvent.type,
      occurredOn: genericEvent.timestamp,
      version: (genericEvent.data.version as number) ?? 1,
      aggregateId:
        genericEvent.correlationId ??
        (genericEvent.data.aggregateId as string) ??
        "",
      data: genericEvent.data,
    };
  }
}

/**
 * Domain event publisher for entities and aggregates
 * Collects events and publishes them in batches
 */
export class DomainEventPublisher {
  private readonly eventBus: IDomainEventBus;
  private readonly logger: Logger;
  private readonly pendingEvents: IDomainEvent[] = [];
  private readonly options: {
    autoPublish: boolean;
    batchSize: number;
    publishDelay: number;
  };
  private publishTimer?: NodeJS.Timeout;

  constructor(
    eventBus: IDomainEventBus,
    logger: Logger,
    options: {
      autoPublish?: boolean;
      batchSize?: number;
      publishDelay?: number;
    } = {},
  ) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.options = {
      autoPublish: options.autoPublish ?? true,
      batchSize: options.batchSize ?? 10,
      publishDelay: options.publishDelay ?? 100,
    };
  }

  /**
   * Add a domain event to be published
   * @param event - Domain event to add
   */
  public addEvent(event: IDomainEvent): void {
    this.pendingEvents.push(event);

    this.logger.debug(
      `DomainEventPublisher: Added domain event: ${event.eventName}`,
      {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        pendingCount: this.pendingEvents.length,
      },
    );

    if (this.options.autoPublish) {
      this.schedulePublish();
    }
  }

  /**
   * Add multiple domain events to be published
   * @param events - Array of domain events to add
   */
  public addEvents(events: IDomainEvent[]): void {
    this.pendingEvents.push(...events);

    this.logger.debug(
      `DomainEventPublisher: Added ${events.length} domain events`,
      {
        eventTypes: events.map((e) => e.eventName),
        pendingCount: this.pendingEvents.length,
      },
    );

    if (this.options.autoPublish) {
      this.schedulePublish();
    }
  }

  /**
   * Publish all pending events immediately
   * @returns Promise that resolves when all events are published
   */
  public async publishNow(): Promise<void> {
    if (this.pendingEvents.length === 0) {
      return;
    }

    const eventsToPublish = [...this.pendingEvents];
    this.pendingEvents.length = 0;

    // Clear any scheduled publish
    if (this.publishTimer) {
      clearTimeout(this.publishTimer);
      this.publishTimer = undefined;
    }

    try {
      this.logger.debug(
        `DomainEventPublisher: Publishing ${eventsToPublish.length} pending events`,
      );

      await this.eventBus.publishAll(eventsToPublish);

      this.logger.debug(
        `DomainEventPublisher: Successfully published ${eventsToPublish.length} events`,
      );
    } catch (error) {
      // Re-add events to pending list on failure
      this.pendingEvents.unshift(...eventsToPublish);

      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`DomainEventPublisher: Failed to publish events`, err, {
        eventCount: eventsToPublish.length,
        pendingCount: this.pendingEvents.length,
      });

      throw err;
    }
  }

  /**
   * Get number of pending events
   * @returns Number of pending events
   */
  public getPendingEventCount(): number {
    return this.pendingEvents.length;
  }

  /**
   * Get pending event types
   * @returns Array of pending event types
   */
  public getPendingEventTypes(): string[] {
    return [...new Set(this.pendingEvents.map((e) => e.eventName))];
  }

  /**
   * Clear all pending events without publishing
   */
  public clearPendingEvents(): void {
    const count = this.pendingEvents.length;
    this.pendingEvents.length = 0;

    if (this.publishTimer) {
      clearTimeout(this.publishTimer);
      this.publishTimer = undefined;
    }

    this.logger.debug(`DomainEventPublisher: Cleared ${count} pending events`);
  }

  /**
   * Schedule automatic publishing
   */
  private schedulePublish(): void {
    // Publish immediately if batch size reached
    if (this.pendingEvents.length >= this.options.batchSize) {
      this.publishNow().catch((error) => {
        this.logger.error(`DomainEventPublisher: Auto-publish failed`, error);
      });
      return;
    }

    // Schedule delayed publish if not already scheduled
    if (!this.publishTimer) {
      this.publishTimer = setTimeout(() => {
        this.publishTimer = undefined;
        this.publishNow().catch((error) => {
          this.logger.error(
            `DomainEventPublisher: Delayed auto-publish failed`,
            error,
          );
        });
      }, this.options.publishDelay);
    }
  }

  /**
   * Dispose resources and clean up timers
   */
  public dispose(): void {
    if (this.publishTimer) {
      clearTimeout(this.publishTimer);
      this.publishTimer = undefined;
    }

    this.clearPendingEvents();
    this.logger.debug("DomainEventPublisher: Disposed");
  }
}
