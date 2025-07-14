/**
 * Base domain event interface
 * Defines contract for all domain events in the system
 */
export interface IDomainEvent {
  /**
   * Unique identifier for the event
   */
  readonly eventId: string;

  /**
   * Name/type of the event
   */
  readonly eventName: string;

  /**
   * Timestamp when the event occurred
   */
  readonly occurredOn: Date;

  /**
   * Version of the event schema
   */
  readonly version: number;

  /**
   * ID of the aggregate that generated this event
   */
  readonly aggregateId: string;

  /**
   * Data payload of the event
   */
  readonly data: Record<string, unknown>;
}

/**
 * Base domain event class
 * Provides common functionality for all domain events
 */
export abstract class DomainEvent implements IDomainEvent {
  public readonly eventId: string;
  public readonly eventName: string;
  public readonly occurredOn: Date;
  public readonly version: number;
  public readonly aggregateId: string;
  public readonly data: Record<string, unknown>;

  protected constructor(
    eventName: string,
    aggregateId: string,
    data: Record<string, unknown>,
    version: number = 1,
  ) {
    this.eventId = this.generateEventId();
    this.eventName = eventName;
    this.aggregateId = aggregateId;
    this.data = data;
    this.version = version;
    this.occurredOn = new Date();
  }

  /**
   * Convert event to plain object for serialization
   * @returns Plain object representation of the event
   */
  public toPlainObject(): Record<string, unknown> {
    return {
      eventId: this.eventId,
      eventName: this.eventName,
      occurredOn: this.occurredOn.toISOString(),
      version: this.version,
      aggregateId: this.aggregateId,
      data: this.data,
    };
  }

  /**
   * Generate unique event ID
   * @returns Unique event identifier
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Domain event handler interface
 * Defines contract for handling domain events
 *
 * @template T - Type of domain event to handle
 */
export interface IDomainEventHandler<T extends IDomainEvent> {
  /**
   * Handle the domain event
   * @param event - Domain event to handle
   * @returns Promise that resolves when event is handled
   */
  handle(event: T): Promise<void>;

  /**
   * Get the event name this handler can process
   * @returns Event name
   */
  getEventName(): string;
}

/**
 * Domain event bus interface
 * Defines contract for publishing and subscribing to domain events
 */
export interface IDomainEventBus {
  /**
   * Publish a domain event
   * @param event - Domain event to publish
   * @returns Promise that resolves when event is published
   */
  publish(event: IDomainEvent): Promise<void>;

  /**
   * Publish multiple domain events
   * @param events - Array of domain events to publish
   * @returns Promise that resolves when all events are published
   */
  publishAll(events: IDomainEvent[]): Promise<void>;

  /**
   * Subscribe to domain events
   * @param handler - Event handler to subscribe
   */
  subscribe<T extends IDomainEvent>(handler: IDomainEventHandler<T>): void;

  /**
   * Unsubscribe from domain events
   * @param handler - Event handler to unsubscribe
   */
  unsubscribe<T extends IDomainEvent>(handler: IDomainEventHandler<T>): void;
}

/**
 * Event store interface
 * Defines contract for persisting domain events
 */
export interface IEventStore {
  /**
   * Save domain event to store
   * @param event - Domain event to save
   * @returns Promise that resolves when event is saved
   */
  save(event: IDomainEvent): Promise<void>;

  /**
   * Get events for a specific aggregate
   * @param aggregateId - ID of the aggregate
   * @param fromVersion - Optional version to start from
   * @returns Promise resolving to array of events
   */
  getEventsForAggregate(
    aggregateId: string,
    fromVersion?: number,
  ): Promise<IDomainEvent[]>;

  /**
   * Get all events of a specific type
   * @param eventName - Name of the event type
   * @param fromDate - Optional date to start from
   * @returns Promise resolving to array of events
   */
  getEventsByType(eventName: string, fromDate?: Date): Promise<IDomainEvent[]>;
}
