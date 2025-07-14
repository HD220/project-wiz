import { IEventStore, IDomainEvent } from "../abstractions/domain-event.type";
import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";

/**
 * Event store entry for persistence
 */
export interface EventStoreEntry {
  /**
   * Unique identifier for the stored event
   */
  readonly id: string;

  /**
   * Event data serialized as JSON
   */
  readonly eventData: string;

  /**
   * Event metadata
   */
  readonly eventName: string;
  readonly aggregateId: string;
  readonly version: number;
  readonly timestamp: Date;

  /**
   * Additional metadata
   */
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly userId?: string;
}

/**
 * Event store configuration options
 */
export interface EventStoreOptions {
  /**
   * Maximum number of events to return in a single query
   */
  readonly maxQuerySize?: number;

  /**
   * Enable event compression
   */
  readonly enableCompression?: boolean;

  /**
   * Enable event encryption
   */
  readonly enableEncryption?: boolean;

  /**
   * Retention period for events (days)
   */
  readonly retentionDays?: number;
}

/**
 * In-memory event store implementation
 * For production, this should be replaced with a persistent store (database)
 */
export class InMemoryEventStore implements IEventStore {
  private readonly events: EventStoreEntry[] = [];
  private readonly aggregateEventIndex = new Map<string, EventStoreEntry[]>();
  private readonly eventTypeIndex = new Map<string, EventStoreEntry[]>();
  private readonly logger: Logger;
  private readonly options: Required<EventStoreOptions>;
  private eventCounter = 0;

  constructor(logger: Logger, options: EventStoreOptions = {}) {
    this.logger = logger;
    this.options = {
      maxQuerySize: options.maxQuerySize ?? 1000,
      enableCompression: options.enableCompression ?? false,
      enableEncryption: options.enableEncryption ?? false,
      retentionDays: options.retentionDays ?? 365,
    };

    this.logger.debug("InMemoryEventStore: Initialized", {
      maxQuerySize: this.options.maxQuerySize,
      retentionDays: this.options.retentionDays,
    });
  }

  /**
   * Save domain event to store
   * @param event - Domain event to save
   * @returns Promise that resolves when event is saved
   */
  public async save(event: IDomainEvent): Promise<void> {
    try {
      const entry: EventStoreEntry = {
        id: this.generateEntryId(),
        eventData: this.serializeEvent(event),
        eventName: event.eventName,
        aggregateId: event.aggregateId,
        version: event.version,
        timestamp: event.occurredOn,
      };

      // Add to main events array
      this.events.push(entry);

      // Update aggregate index
      if (!this.aggregateEventIndex.has(event.aggregateId)) {
        this.aggregateEventIndex.set(event.aggregateId, []);
      }
      this.aggregateEventIndex.get(event.aggregateId)!.push(entry);

      // Update event type index
      if (!this.eventTypeIndex.has(event.eventName)) {
        this.eventTypeIndex.set(event.eventName, []);
      }
      this.eventTypeIndex.get(event.eventName)!.push(entry);

      this.logger.debug(`EventStore: Saved event: ${event.eventName}`, {
        eventId: event.eventId,
        aggregateId: event.aggregateId,
        version: event.version,
        entryId: entry.id,
        totalEvents: this.events.length,
      });

      // Clean up old events if needed
      await this.cleanupOldEvents();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventStore: Failed to save event: ${event.eventName}`,
        err,
        {
          eventId: event.eventId,
          aggregateId: event.aggregateId,
        },
      );

      throw err;
    }
  }

  /**
   * Get events for a specific aggregate
   * @param aggregateId - ID of the aggregate
   * @param fromVersion - Optional version to start from
   * @returns Promise resolving to array of events
   */
  public async getEventsForAggregate(
    aggregateId: string,
    fromVersion?: number,
  ): Promise<IDomainEvent[]> {
    try {
      this.logger.debug(
        `EventStore: Getting events for aggregate: ${aggregateId}`,
        {
          fromVersion,
        },
      );

      const aggregateEvents = this.aggregateEventIndex.get(aggregateId) ?? [];

      let filteredEvents = aggregateEvents;
      if (fromVersion !== undefined) {
        filteredEvents = aggregateEvents.filter(
          (entry) => entry.version >= fromVersion,
        );
      }

      // Apply query size limit
      if (filteredEvents.length > this.options.maxQuerySize) {
        this.logger.warn(
          `EventStore: Query size limit exceeded for aggregate: ${aggregateId}`,
          {
            eventCount: filteredEvents.length,
            maxQuerySize: this.options.maxQuerySize,
          },
        );

        filteredEvents = filteredEvents.slice(0, this.options.maxQuerySize);
      }

      const events = filteredEvents.map((entry) =>
        this.deserializeEvent(entry),
      );

      this.logger.debug(
        `EventStore: Retrieved ${events.length} events for aggregate: ${aggregateId}`,
        {
          fromVersion,
          totalEventsForAggregate: aggregateEvents.length,
        },
      );

      return events;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventStore: Failed to get events for aggregate: ${aggregateId}`,
        err,
      );
      throw err;
    }
  }

  /**
   * Get all events of a specific type
   * @param eventName - Name of the event type
   * @param fromDate - Optional date to start from
   * @returns Promise resolving to array of events
   */
  public async getEventsByType(
    eventName: string,
    fromDate?: Date,
  ): Promise<IDomainEvent[]> {
    try {
      this.logger.debug(`EventStore: Getting events by type: ${eventName}`, {
        fromDate: fromDate?.toISOString(),
      });

      const typeEvents = this.eventTypeIndex.get(eventName) ?? [];

      let filteredEvents = typeEvents;
      if (fromDate) {
        filteredEvents = typeEvents.filter(
          (entry) => entry.timestamp >= fromDate,
        );
      }

      // Apply query size limit
      if (filteredEvents.length > this.options.maxQuerySize) {
        this.logger.warn(
          `EventStore: Query size limit exceeded for event type: ${eventName}`,
          {
            eventCount: filteredEvents.length,
            maxQuerySize: this.options.maxQuerySize,
          },
        );

        filteredEvents = filteredEvents.slice(0, this.options.maxQuerySize);
      }

      const events = filteredEvents.map((entry) =>
        this.deserializeEvent(entry),
      );

      this.logger.debug(
        `EventStore: Retrieved ${events.length} events of type: ${eventName}`,
        {
          fromDate: fromDate?.toISOString(),
          totalEventsOfType: typeEvents.length,
        },
      );

      return events;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventStore: Failed to get events by type: ${eventName}`,
        err,
      );
      throw err;
    }
  }

  /**
   * Get all events in the store
   * @param limit - Maximum number of events to return
   * @param offset - Number of events to skip
   * @returns Promise resolving to array of events
   */
  public async getAllEvents(
    limit?: number,
    offset?: number,
  ): Promise<IDomainEvent[]> {
    try {
      this.logger.debug("EventStore: Getting all events", {
        limit,
        offset,
        totalEvents: this.events.length,
      });

      let events = [...this.events];

      // Apply offset
      if (offset && offset > 0) {
        events = events.slice(offset);
      }

      // Apply limit
      if (limit && limit > 0) {
        events = events.slice(0, limit);
      }

      const domainEvents = events.map((entry) => this.deserializeEvent(entry));

      this.logger.debug(`EventStore: Retrieved ${domainEvents.length} events`, {
        limit,
        offset,
        totalEvents: this.events.length,
      });

      return domainEvents;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("EventStore: Failed to get all events", err);
      throw err;
    }
  }

  /**
   * Get event store statistics
   * @returns Store statistics
   */
  public getStats(): {
    totalEvents: number;
    uniqueAggregates: number;
    uniqueEventTypes: number;
    oldestEvent: Date | null;
    newestEvent: Date | null;
  } {
    if (this.events.length === 0) {
      return {
        totalEvents: 0,
        uniqueAggregates: 0,
        uniqueEventTypes: 0,
        oldestEvent: null,
        newestEvent: null,
      };
    }

    const timestamps = this.events.map((e) => e.timestamp.getTime());
    const oldest = new Date(Math.min(...timestamps));
    const newest = new Date(Math.max(...timestamps));

    return {
      totalEvents: this.events.length,
      uniqueAggregates: this.aggregateEventIndex.size,
      uniqueEventTypes: this.eventTypeIndex.size,
      oldestEvent: oldest,
      newestEvent: newest,
    };
  }

  /**
   * Clear all events from the store
   */
  public clear(): void {
    const eventCount = this.events.length;

    this.events.length = 0;
    this.aggregateEventIndex.clear();
    this.eventTypeIndex.clear();

    this.logger.debug(`EventStore: Cleared all events`, {
      clearedCount: eventCount,
    });
  }

  /**
   * Serialize domain event to JSON
   * @param event - Domain event to serialize
   * @returns Serialized event data
   */
  private serializeEvent(event: IDomainEvent): string {
    try {
      const eventData = {
        eventId: event.eventId,
        eventName: event.eventName,
        occurredOn: event.occurredOn.toISOString(),
        version: event.version,
        aggregateId: event.aggregateId,
        data: event.data,
      };

      return JSON.stringify(eventData);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventStore: Failed to serialize event: ${event.eventName}`,
        err,
      );
      throw err;
    }
  }

  /**
   * Deserialize event data to domain event
   * @param entry - Event store entry
   * @returns Domain event
   */
  private deserializeEvent(entry: EventStoreEntry): IDomainEvent {
    try {
      const eventData = JSON.parse(entry.eventData);

      return {
        eventId: eventData.eventId,
        eventName: eventData.eventName,
        occurredOn: new Date(eventData.occurredOn),
        version: eventData.version,
        aggregateId: eventData.aggregateId,
        data: eventData.data,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventStore: Failed to deserialize event entry: ${entry.id}`,
        err,
      );
      throw err;
    }
  }

  /**
   * Generate unique entry ID
   * @returns Entry ID
   */
  private generateEntryId(): string {
    return `event-${Date.now()}-${++this.eventCounter}`;
  }

  /**
   * Clean up old events based on retention policy
   */
  private async cleanupOldEvents(): Promise<void> {
    if (this.options.retentionDays <= 0) {
      return; // No cleanup if retention is disabled
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);

    const initialCount = this.events.length;
    let removedCount = 0;

    // Remove old events
    for (let i = this.events.length - 1; i >= 0; i--) {
      const entry = this.events[i];
      if (entry.timestamp < cutoffDate) {
        // Remove from main array
        this.events.splice(i, 1);
        removedCount++;

        // Remove from aggregate index
        const aggregateEvents = this.aggregateEventIndex.get(entry.aggregateId);
        if (aggregateEvents) {
          const aggIndex = aggregateEvents.indexOf(entry);
          if (aggIndex > -1) {
            aggregateEvents.splice(aggIndex, 1);
          }
          if (aggregateEvents.length === 0) {
            this.aggregateEventIndex.delete(entry.aggregateId);
          }
        }

        // Remove from event type index
        const typeEvents = this.eventTypeIndex.get(entry.eventName);
        if (typeEvents) {
          const typeIndex = typeEvents.indexOf(entry);
          if (typeIndex > -1) {
            typeEvents.splice(typeIndex, 1);
          }
          if (typeEvents.length === 0) {
            this.eventTypeIndex.delete(entry.eventName);
          }
        }
      }
    }

    if (removedCount > 0) {
      this.logger.debug(`EventStore: Cleaned up ${removedCount} old events`, {
        cutoffDate: cutoffDate.toISOString(),
        remainingEvents: this.events.length,
        retentionDays: this.options.retentionDays,
      });
    }
  }
}
