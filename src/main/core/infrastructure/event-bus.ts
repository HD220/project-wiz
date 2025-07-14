import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";

/**
 * Generic event interface for the EventBus system
 * All events must implement this interface
 */
export interface IEvent {
  /**
   * Unique identifier for the event
   */
  readonly id: string;

  /**
   * Type/name of the event
   */
  readonly type: string;

  /**
   * Timestamp when the event occurred
   */
  readonly timestamp: Date;

  /**
   * Optional correlation ID for tracking
   */
  readonly correlationId?: string;

  /**
   * Event payload data
   */
  readonly data: Record<string, unknown>;
}

/**
 * Event handler function signature
 * @template T - Type of event to handle
 */
export type EventHandler<T extends IEvent> = (event: T) => Promise<void>;

/**
 * Event subscription configuration
 */
export interface EventSubscription {
  /**
   * Unique subscription ID
   */
  readonly id: string;

  /**
   * Event type this subscription handles
   */
  readonly eventType: string;

  /**
   * Handler function
   */
  readonly handler: EventHandler<IEvent>;

  /**
   * Optional filter predicate
   */
  readonly filter?: (event: IEvent) => boolean;

  /**
   * Whether this is a one-time subscription
   */
  readonly once?: boolean;

  /**
   * Priority for execution order (higher = executed first)
   */
  readonly priority?: number;
}

/**
 * Event dispatch result
 */
export interface EventDispatchResult {
  /**
   * Event that was dispatched
   */
  readonly event: IEvent;

  /**
   * Number of handlers that processed the event
   */
  readonly handlerCount: number;

  /**
   * Number of handlers that succeeded
   */
  readonly successCount: number;

  /**
   * Number of handlers that failed
   */
  readonly failureCount: number;

  /**
   * Array of errors from failed handlers
   */
  readonly errors: Error[];
}

/**
 * EventBus configuration options
 */
export interface EventBusOptions {
  /**
   * Maximum number of concurrent handlers
   */
  readonly maxConcurrentHandlers?: number;

  /**
   * Timeout for handler execution (ms)
   */
  readonly handlerTimeout?: number;

  /**
   * Whether to continue processing if a handler fails
   */
  readonly continueOnError?: boolean;

  /**
   * Enable dead letter queue for failed events
   */
  readonly enableDeadLetterQueue?: boolean;
}

/**
 * Advanced EventBus implementation with publish/subscribe pattern
 * Provides robust event handling with filtering, priorities, and error handling
 */
export class EventBus {
  private readonly subscriptions = new Map<string, EventSubscription[]>();
  private readonly deadLetterQueue: IEvent[] = [];
  private readonly logger: Logger;
  private readonly options: Required<EventBusOptions>;
  private subscriptionCounter = 0;

  constructor(logger: Logger, options: EventBusOptions = {}) {
    this.logger = logger;
    this.options = {
      maxConcurrentHandlers: options.maxConcurrentHandlers ?? 10,
      handlerTimeout: options.handlerTimeout ?? 30000,
      continueOnError: options.continueOnError ?? true,
      enableDeadLetterQueue: options.enableDeadLetterQueue ?? true,
    };
  }

  /**
   * Subscribe to events of a specific type
   * @param eventType - Type of events to subscribe to
   * @param handler - Handler function to execute
   * @param options - Optional subscription configuration
   * @returns Subscription object for managing the subscription
   */
  public subscribe<T extends IEvent>(
    eventType: string,
    handler: EventHandler<T>,
    options: Partial<
      Omit<EventSubscription, "id" | "eventType" | "handler">
    > = {},
  ): EventSubscription {
    const subscription: EventSubscription = {
      id: this.generateSubscriptionId(),
      eventType,
      handler: handler as EventHandler<IEvent>,
      filter: options.filter,
      once: options.once ?? false,
      priority: options.priority ?? 0,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, []);
    }

    const subscriptions = this.subscriptions.get(eventType)!;
    subscriptions.push(subscription);

    // Sort by priority (highest first)
    subscriptions.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    this.logger.debug(`EventBus: Subscribed to event type: ${eventType}`, {
      subscriptionId: subscription.id,
      priority: subscription.priority,
      totalSubscriptions: subscriptions.length,
    });

    return subscription;
  }

  /**
   * Unsubscribe from events
   * @param subscription - Subscription to remove
   * @returns True if subscription was found and removed
   */
  public unsubscribe(subscription: EventSubscription): boolean {
    const subscriptions = this.subscriptions.get(subscription.eventType);
    if (!subscriptions) {
      return false;
    }

    const index = subscriptions.findIndex((s) => s.id === subscription.id);
    if (index === -1) {
      return false;
    }

    subscriptions.splice(index, 1);

    if (subscriptions.length === 0) {
      this.subscriptions.delete(subscription.eventType);
    }

    this.logger.debug(
      `EventBus: Unsubscribed from event type: ${subscription.eventType}`,
      {
        subscriptionId: subscription.id,
      },
    );

    return true;
  }

  /**
   * Publish an event to all subscribers
   * @param event - Event to publish
   * @returns Result containing dispatch information
   */
  public async publish<T extends IEvent>(
    event: T,
  ): Promise<Result<EventDispatchResult, Error>> {
    try {
      this.logger.debug(`EventBus: Publishing event: ${event.type}`, {
        eventId: event.id,
        correlationId: event.correlationId,
      });

      const subscriptions = this.subscriptions.get(event.type) ?? [];
      const applicableSubscriptions = subscriptions.filter(
        (sub) => !sub.filter || sub.filter(event),
      );

      if (applicableSubscriptions.length === 0) {
        this.logger.debug(
          `EventBus: No handlers found for event: ${event.type}`,
          {
            eventId: event.id,
          },
        );

        return Result.success({
          event,
          handlerCount: 0,
          successCount: 0,
          failureCount: 0,
          errors: [],
        });
      }

      const { successCount, failureCount, errors } = await this.executeHandlers(
        event,
        applicableSubscriptions,
      );

      // Remove one-time subscriptions
      this.removeOneTimeSubscriptions(applicableSubscriptions);

      const result: EventDispatchResult = {
        event,
        handlerCount: applicableSubscriptions.length,
        successCount,
        failureCount,
        errors,
      };

      // Add to dead letter queue if all handlers failed
      if (
        failureCount === applicableSubscriptions.length &&
        this.options.enableDeadLetterQueue
      ) {
        this.deadLetterQueue.push(event);
        this.logger.warn(
          `EventBus: Event added to dead letter queue: ${event.type}`,
          {
            eventId: event.id,
            errors: errors.map((e) => e.message),
          },
        );
      }

      this.logger.debug(`EventBus: Event processed: ${event.type}`, {
        eventId: event.id,
        handlerCount: result.handlerCount,
        successCount: result.successCount,
        failureCount: result.failureCount,
      });

      return Result.success(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventBus: Failed to publish event: ${event.type}`,
        err,
      );
      return Result.failure(err);
    }
  }

  /**
   * Get all registered event types
   * @returns Array of event types
   */
  public getRegisteredEventTypes(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get number of subscriptions for an event type
   * @param eventType - Event type to check
   * @returns Number of subscriptions
   */
  public getSubscriptionCount(eventType: string): number {
    return this.subscriptions.get(eventType)?.length ?? 0;
  }

  /**
   * Get events in dead letter queue
   * @returns Array of failed events
   */
  public getDeadLetterQueue(): readonly IEvent[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear dead letter queue
   */
  public clearDeadLetterQueue(): void {
    this.deadLetterQueue.length = 0;
    this.logger.debug("EventBus: Dead letter queue cleared");
  }

  /**
   * Execute handlers for an event
   * @param event - Event to process
   * @param subscriptions - Subscriptions to execute
   * @returns Execution results
   */
  private async executeHandlers(
    event: IEvent,
    subscriptions: EventSubscription[],
  ): Promise<{ successCount: number; failureCount: number; errors: Error[] }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: Error[] = [];

    // Process handlers with concurrency limit
    const chunks = this.chunkArray(
      subscriptions,
      this.options.maxConcurrentHandlers,
    );

    for (const chunk of chunks) {
      const promises = chunk.map(async (subscription) => {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Handler timeout")),
              this.options.handlerTimeout,
            ),
          );

          await Promise.race([subscription.handler(event), timeoutPromise]);
          successCount++;
        } catch (error) {
          failureCount++;
          const err = error instanceof Error ? error : new Error(String(error));
          errors.push(err);

          this.logger.error(
            `EventBus: Handler failed for event: ${event.type}`,
            err,
            {
              eventId: event.id,
              subscriptionId: subscription.id,
            },
          );

          if (!this.options.continueOnError) {
            throw err;
          }
        }
      });

      await Promise.allSettled(promises);
    }

    return { successCount, failureCount, errors };
  }

  /**
   * Remove one-time subscriptions after execution
   * @param subscriptions - Subscriptions that were executed
   */
  private removeOneTimeSubscriptions(subscriptions: EventSubscription[]): void {
    const oneTimeSubscriptions = subscriptions.filter((sub) => sub.once);
    for (const subscription of oneTimeSubscriptions) {
      this.unsubscribe(subscription);
    }
  }

  /**
   * Split array into chunks
   * @param array - Array to chunk
   * @param chunkSize - Size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Generate unique subscription ID
   * @returns Subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${++this.subscriptionCounter}`;
  }
}
