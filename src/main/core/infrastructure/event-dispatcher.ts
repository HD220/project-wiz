import { Logger } from "./logger";
import { EventBus, IEvent } from "./event-bus";
import { Result } from "../abstractions/result.type";

/**
 * Event dispatching strategies
 */
export enum DispatchStrategy {
  /**
   * Immediate synchronous dispatch
   */
  IMMEDIATE = "immediate",

  /**
   * Asynchronous dispatch (fire and forget)
   */
  ASYNC = "async",

  /**
   * Batched dispatch (collect and dispatch in batches)
   */
  BATCHED = "batched",

  /**
   * Delayed dispatch (dispatch after a delay)
   */
  DELAYED = "delayed",
}

/**
 * Dispatch options for event processing
 */
export interface DispatchOptions {
  /**
   * Dispatch strategy to use
   */
  readonly strategy?: DispatchStrategy;

  /**
   * Delay in milliseconds (for DELAYED strategy)
   */
  readonly delay?: number;

  /**
   * Batch size (for BATCHED strategy)
   */
  readonly batchSize?: number;

  /**
   * Batch timeout in milliseconds (for BATCHED strategy)
   */
  readonly batchTimeout?: number;

  /**
   * Priority for event processing
   */
  readonly priority?: number;

  /**
   * Retry options for failed dispatches
   */
  readonly retry?: {
    maxAttempts: number;
    backoffMs: number;
    exponential?: boolean;
  };
}

/**
 * Dispatch result information
 */
export interface DispatchResult {
  /**
   * Events that were dispatched
   */
  readonly events: IEvent[];

  /**
   * Number of events successfully dispatched
   */
  readonly successCount: number;

  /**
   * Number of events that failed to dispatch
   */
  readonly failureCount: number;

  /**
   * Strategy used for dispatch
   */
  readonly strategy: DispatchStrategy;

  /**
   * Total processing time in milliseconds
   */
  readonly processingTimeMs: number;
}

/**
 * Batched event container
 */
interface BatchedEvent {
  readonly event: IEvent;
  readonly options: DispatchOptions;
  readonly timestamp: number;
}

/**
 * Advanced event dispatcher that provides different dispatching strategies
 * Supports immediate, async, batched, and delayed event processing
 */
export class EventDispatcher {
  private readonly eventBus: EventBus;
  private readonly logger: Logger;
  private readonly pendingBatches = new Map<string, BatchedEvent[]>();
  private readonly batchTimers = new Map<string, NodeJS.Timeout>();
  private readonly delayedEvents: Array<{
    event: IEvent;
    options: DispatchOptions;
    executeAt: number;
  }> = [];
  private delayedProcessingTimer?: NodeJS.Timeout;

  constructor(eventBus: EventBus, logger: Logger) {
    this.eventBus = eventBus;
    this.logger = logger;

    // Start delayed event processing
    this.startDelayedEventProcessing();
  }

  /**
   * Dispatch a single event using the specified strategy
   * @param event - Event to dispatch
   * @param options - Dispatch options
   * @returns Result containing dispatch information
   */
  public async dispatch(
    event: IEvent,
    options: DispatchOptions = {},
  ): Promise<Result<DispatchResult, Error>> {
    const strategy = options.strategy ?? DispatchStrategy.IMMEDIATE;

    try {
      this.logger.debug(
        `EventDispatcher: Dispatching event with strategy: ${strategy}`,
        {
          eventId: event.id,
          eventType: event.type,
          strategy,
        },
      );

      switch (strategy) {
        case DispatchStrategy.IMMEDIATE:
          return await this.dispatchImmediate(event, options);

        case DispatchStrategy.ASYNC:
          return await this.dispatchAsync(event, options);

        case DispatchStrategy.BATCHED:
          return await this.dispatchBatched(event, options);

        case DispatchStrategy.DELAYED:
          return await this.dispatchDelayed(event, options);

        default:
          const error = new Error(`Unknown dispatch strategy: ${strategy}`);
          this.logger.error(
            "EventDispatcher: Unknown dispatch strategy",
            error,
          );
          return Result.failure(error);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `EventDispatcher: Failed to dispatch event: ${event.type}`,
        err,
      );
      return Result.failure(err);
    }
  }

  /**
   * Dispatch multiple events using the specified strategy
   * @param events - Events to dispatch
   * @param options - Dispatch options
   * @returns Result containing dispatch information
   */
  public async dispatchAll(
    events: IEvent[],
    options: DispatchOptions = {},
  ): Promise<Result<DispatchResult, Error>> {
    if (events.length === 0) {
      return Result.success({
        events: [],
        successCount: 0,
        failureCount: 0,
        strategy: options.strategy ?? DispatchStrategy.IMMEDIATE,
        processingTimeMs: 0,
      });
    }

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    try {
      this.logger.debug(
        `EventDispatcher: Dispatching ${events.length} events`,
        {
          strategy: options.strategy,
          eventTypes: events.map((e) => e.type),
        },
      );

      const results = await Promise.allSettled(
        events.map((event) => this.dispatch(event, options)),
      );

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.isSuccess) {
          successCount += result.value.value.successCount;
          failureCount += result.value.value.failureCount;
        } else {
          failureCount++;
        }
      }

      const processingTimeMs = Date.now() - startTime;

      return Result.success({
        events,
        successCount,
        failureCount,
        strategy: options.strategy ?? DispatchStrategy.IMMEDIATE,
        processingTimeMs,
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("EventDispatcher: Failed to dispatch events", err);
      return Result.failure(err);
    }
  }

  /**
   * Flush all pending batched events
   * @returns Result containing flush information
   */
  public async flushBatches(): Promise<Result<DispatchResult[], Error>> {
    try {
      const results: DispatchResult[] = [];

      for (const [batchKey, events] of this.pendingBatches.entries()) {
        if (events.length > 0) {
          const result = await this.processBatch(events);
          if (result.isSuccess) {
            results.push(result.value);
          }
        }

        // Clear the batch
        this.pendingBatches.delete(batchKey);
        const timer = this.batchTimers.get(batchKey);
        if (timer) {
          clearTimeout(timer);
          this.batchTimers.delete(batchKey);
        }
      }

      this.logger.debug(`EventDispatcher: Flushed ${results.length} batches`);
      return Result.success(results);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error("EventDispatcher: Failed to flush batches", err);
      return Result.failure(err);
    }
  }

  /**
   * Get number of pending batched events
   * @returns Number of pending events
   */
  public getPendingBatchCount(): number {
    let count = 0;
    for (const events of this.pendingBatches.values()) {
      count += events.length;
    }
    return count;
  }

  /**
   * Get number of pending delayed events
   * @returns Number of delayed events
   */
  public getPendingDelayedCount(): number {
    return this.delayedEvents.length;
  }

  /**
   * Dispose resources and clean up timers
   */
  public dispose(): void {
    // Clear batch timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    this.batchTimers.clear();
    this.pendingBatches.clear();

    // Clear delayed processing timer
    if (this.delayedProcessingTimer) {
      clearTimeout(this.delayedProcessingTimer);
      this.delayedProcessingTimer = undefined;
    }
    this.delayedEvents.length = 0;

    this.logger.debug("EventDispatcher: Disposed");
  }

  /**
   * Dispatch event immediately
   * @param event - Event to dispatch
   * @param options - Dispatch options
   * @returns Dispatch result
   */
  private async dispatchImmediate(
    event: IEvent,
    options: DispatchOptions,
  ): Promise<Result<DispatchResult, Error>> {
    const startTime = Date.now();

    const result = await this.executeWithRetry(event, options);
    const processingTimeMs = Date.now() - startTime;

    if (result.isSuccess) {
      return Result.success({
        events: [event],
        successCount: result.value.successCount,
        failureCount: result.value.failureCount,
        strategy: DispatchStrategy.IMMEDIATE,
        processingTimeMs,
      });
    }

    return Result.failure(result.error);
  }

  /**
   * Dispatch event asynchronously (fire and forget)
   * @param event - Event to dispatch
   * @param options - Dispatch options
   * @returns Dispatch result (immediate)
   */
  private async dispatchAsync(
    event: IEvent,
    options: DispatchOptions,
  ): Promise<Result<DispatchResult, Error>> {
    // Start async processing without waiting
    this.executeWithRetry(event, options).catch((error) => {
      this.logger.error(
        `EventDispatcher: Async dispatch failed for event: ${event.type}`,
        error,
      );
    });

    // Return immediate success
    return Result.success({
      events: [event],
      successCount: 1,
      failureCount: 0,
      strategy: DispatchStrategy.ASYNC,
      processingTimeMs: 0,
    });
  }

  /**
   * Add event to batch for later processing
   * @param event - Event to batch
   * @param options - Dispatch options
   * @returns Dispatch result
   */
  private async dispatchBatched(
    event: IEvent,
    options: DispatchOptions,
  ): Promise<Result<DispatchResult, Error>> {
    const batchKey = event.type;
    const batchSize = options.batchSize ?? 10;
    const batchTimeout = options.batchTimeout ?? 5000;

    if (!this.pendingBatches.has(batchKey)) {
      this.pendingBatches.set(batchKey, []);
    }

    const batch = this.pendingBatches.get(batchKey)!;
    batch.push({
      event,
      options,
      timestamp: Date.now(),
    });

    // Process batch if size limit reached
    if (batch.length >= batchSize) {
      return await this.processBatchAndClear(batchKey);
    }

    // Set timeout for batch processing if not already set
    if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.processBatchAndClear(batchKey).catch((error) => {
          this.logger.error(
            `EventDispatcher: Batch timeout processing failed: ${batchKey}`,
            error,
          );
        });
      }, batchTimeout);

      this.batchTimers.set(batchKey, timer);
    }

    // Return immediate success for batched event
    return Result.success({
      events: [event],
      successCount: 1,
      failureCount: 0,
      strategy: DispatchStrategy.BATCHED,
      processingTimeMs: 0,
    });
  }

  /**
   * Schedule event for delayed processing
   * @param event - Event to delay
   * @param options - Dispatch options
   * @returns Dispatch result
   */
  private async dispatchDelayed(
    event: IEvent,
    options: DispatchOptions,
  ): Promise<Result<DispatchResult, Error>> {
    const delay = options.delay ?? 1000;
    const executeAt = Date.now() + delay;

    this.delayedEvents.push({
      event,
      options,
      executeAt,
    });

    // Sort by execution time
    this.delayedEvents.sort((a, b) => a.executeAt - b.executeAt);

    this.logger.debug(
      `EventDispatcher: Scheduled delayed event: ${event.type}`,
      {
        eventId: event.id,
        delay,
        executeAt: new Date(executeAt),
      },
    );

    return Result.success({
      events: [event],
      successCount: 1,
      failureCount: 0,
      strategy: DispatchStrategy.DELAYED,
      processingTimeMs: 0,
    });
  }

  /**
   * Process a batch and clear it
   * @param batchKey - Batch key
   * @returns Dispatch result
   */
  private async processBatchAndClear(
    batchKey: string,
  ): Promise<Result<DispatchResult, Error>> {
    const batch = this.pendingBatches.get(batchKey) ?? [];
    const timer = this.batchTimers.get(batchKey);

    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }

    this.pendingBatches.delete(batchKey);

    return await this.processBatch(batch);
  }

  /**
   * Process a batch of events
   * @param batch - Batch to process
   * @returns Dispatch result
   */
  private async processBatch(
    batch: BatchedEvent[],
  ): Promise<Result<DispatchResult, Error>> {
    if (batch.length === 0) {
      return Result.success({
        events: [],
        successCount: 0,
        failureCount: 0,
        strategy: DispatchStrategy.BATCHED,
        processingTimeMs: 0,
      });
    }

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    this.logger.debug(
      `EventDispatcher: Processing batch of ${batch.length} events`,
    );

    const results = await Promise.allSettled(
      batch.map(({ event, options }) => this.executeWithRetry(event, options)),
    );

    for (const result of results) {
      if (result.status === "fulfilled" && result.value.isSuccess) {
        successCount += result.value.value.successCount;
        failureCount += result.value.value.failureCount;
      } else {
        failureCount++;
      }
    }

    const processingTimeMs = Date.now() - startTime;

    return Result.success({
      events: batch.map((b) => b.event),
      successCount,
      failureCount,
      strategy: DispatchStrategy.BATCHED,
      processingTimeMs,
    });
  }

  /**
   * Execute event dispatch with retry logic
   * @param event - Event to execute
   * @param options - Dispatch options
   * @returns Execution result
   */
  private async executeWithRetry(
    event: IEvent,
    options: DispatchOptions,
  ): Promise<Result<any, Error>> {
    const retry = options.retry ?? { maxAttempts: 1, backoffMs: 1000 };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        const result = await this.eventBus.publish(event);
        if (result.isSuccess) {
          return result;
        }

        lastError = result.error;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }

      if (attempt < retry.maxAttempts) {
        const backoff = retry.exponential
          ? retry.backoffMs * Math.pow(2, attempt - 1)
          : retry.backoffMs;

        this.logger.debug(
          `EventDispatcher: Retrying event dispatch (attempt ${attempt + 1}/${retry.maxAttempts})`,
          {
            eventId: event.id,
            backoffMs: backoff,
          },
        );

        await new Promise((resolve) => setTimeout(resolve, backoff));
      }
    }

    return Result.failure(
      lastError ?? new Error("Unknown error during event dispatch"),
    );
  }

  /**
   * Start delayed event processing loop
   */
  private startDelayedEventProcessing(): void {
    const processDelayedEvents = () => {
      const now = Date.now();
      const eventsToProcess: Array<{
        event: IEvent;
        options: DispatchOptions;
      }> = [];

      // Find events ready for processing
      while (
        this.delayedEvents.length > 0 &&
        this.delayedEvents[0].executeAt <= now
      ) {
        const { event, options } = this.delayedEvents.shift()!;
        eventsToProcess.push({ event, options });
      }

      // Process ready events
      for (const { event, options } of eventsToProcess) {
        this.executeWithRetry(event, options).catch((error) => {
          this.logger.error(
            `EventDispatcher: Delayed event processing failed: ${event.type}`,
            error,
          );
        });
      }

      // Schedule next processing
      this.delayedProcessingTimer = setTimeout(processDelayedEvents, 100);
    };

    this.delayedProcessingTimer = setTimeout(processDelayedEvents, 100);
  }
}
