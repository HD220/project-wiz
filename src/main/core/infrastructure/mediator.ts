import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";

/**
 * Base request interface for Mediator pattern
 * All requests must implement this interface
 */
export interface IRequest<TResponse = void> {
  /**
   * Unique identifier for the request
   */
  readonly requestId: string;

  /**
   * Type/name of the request
   */
  readonly requestType: string;

  /**
   * Optional correlation ID for tracking
   */
  readonly correlationId?: string;

  /**
   * Request metadata
   */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Base notification interface for Mediator pattern
 * Notifications are fire-and-forget messages
 */
export interface INotification {
  /**
   * Unique identifier for the notification
   */
  readonly notificationId: string;

  /**
   * Type/name of the notification
   */
  readonly notificationType: string;

  /**
   * Optional correlation ID for tracking
   */
  readonly correlationId?: string;

  /**
   * Notification data
   */
  readonly data: Record<string, unknown>;

  /**
   * Timestamp when notification was created
   */
  readonly timestamp: Date;
}

/**
 * Request handler interface
 * Handles requests and returns responses
 *
 * @template TRequest - Type of request to handle
 * @template TResponse - Type of response to return
 */
export interface IRequestHandler<
  TRequest extends IRequest<TResponse>,
  TResponse,
> {
  /**
   * Handle the request
   * @param request - Request to handle
   * @returns Promise resolving to Result with response or error
   */
  handle(request: TRequest): Promise<Result<TResponse, Error>>;

  /**
   * Get the request type this handler can process
   * @returns Request type
   */
  getRequestType(): string;
}

/**
 * Notification handler interface
 * Handles notifications (fire-and-forget)
 *
 * @template TNotification - Type of notification to handle
 */
export interface INotificationHandler<TNotification extends INotification> {
  /**
   * Handle the notification
   * @param notification - Notification to handle
   * @returns Promise that resolves when notification is handled
   */
  handle(notification: TNotification): Promise<void>;

  /**
   * Get the notification type this handler can process
   * @returns Notification type
   */
  getNotificationType(): string;
}

/**
 * Pipeline behavior interface for request/response
 * Allows intercepting and modifying requests and responses
 *
 * @template TRequest - Type of request
 * @template TResponse - Type of response
 */
export interface IPipelineBehavior<
  TRequest extends IRequest<TResponse>,
  TResponse,
> {
  /**
   * Handle the request with next handler in pipeline
   * @param request - Request to handle
   * @param next - Next handler in pipeline
   * @returns Promise resolving to Result with response or error
   */
  handle(
    request: TRequest,
    next: (request: TRequest) => Promise<Result<TResponse, Error>>,
  ): Promise<Result<TResponse, Error>>;

  /**
   * Get priority for pipeline ordering (higher = executed first)
   * @returns Priority value
   */
  getPriority(): number;

  /**
   * Check if this behavior applies to the request type
   * @param requestType - Request type to check
   * @returns True if behavior applies
   */
  appliesTo(requestType: string): boolean;
}

/**
 * Mediator configuration options
 */
export interface MediatorOptions {
  /**
   * Maximum request processing timeout (ms)
   */
  readonly requestTimeout?: number;

  /**
   * Enable request/response logging
   */
  readonly enableLogging?: boolean;

  /**
   * Maximum number of concurrent notifications
   */
  readonly maxConcurrentNotifications?: number;
}

/**
 * Request processing context
 */
export interface RequestContext<
  TRequest extends IRequest<TResponse>,
  TResponse,
> {
  readonly request: TRequest;
  readonly startTime: number;
  readonly correlationId: string;
}

/**
 * Mediator implementation that provides request/response and notification patterns
 * Supports pipeline behaviors for cross-cutting concerns
 */
export class Mediator {
  private readonly requestHandlers = new Map<
    string,
    IRequestHandler<any, any>
  >();
  private readonly notificationHandlers = new Map<
    string,
    INotificationHandler<any>[]
  >();
  private readonly pipelineBehaviors: IPipelineBehavior<any, any>[] = [];
  private readonly logger: Logger;
  private readonly options: Required<MediatorOptions>;
  private requestCounter = 0;

  constructor(logger: Logger, options: MediatorOptions = {}) {
    this.logger = logger;
    this.options = {
      requestTimeout: options.requestTimeout ?? 30000,
      enableLogging: options.enableLogging ?? true,
      maxConcurrentNotifications: options.maxConcurrentNotifications ?? 10,
    };
  }

  /**
   * Register a request handler
   * @param handler - Request handler to register
   */
  public registerRequestHandler<
    TRequest extends IRequest<TResponse>,
    TResponse,
  >(handler: IRequestHandler<TRequest, TResponse>): void {
    const requestType = handler.getRequestType();

    if (this.requestHandlers.has(requestType)) {
      throw new Error(
        `Request handler already registered for type: ${requestType}`,
      );
    }

    this.requestHandlers.set(requestType, handler);

    if (this.options.enableLogging) {
      this.logger.debug(
        `Mediator: Registered request handler for type: ${requestType}`,
      );
    }
  }

  /**
   * Register a notification handler
   * @param handler - Notification handler to register
   */
  public registerNotificationHandler<TNotification extends INotification>(
    handler: INotificationHandler<TNotification>,
  ): void {
    const notificationType = handler.getNotificationType();

    if (!this.notificationHandlers.has(notificationType)) {
      this.notificationHandlers.set(notificationType, []);
    }

    this.notificationHandlers.get(notificationType)!.push(handler);

    if (this.options.enableLogging) {
      this.logger.debug(
        `Mediator: Registered notification handler for type: ${notificationType}`,
      );
    }
  }

  /**
   * Register a pipeline behavior
   * @param behavior - Pipeline behavior to register
   */
  public registerPipelineBehavior<
    TRequest extends IRequest<TResponse>,
    TResponse,
  >(behavior: IPipelineBehavior<TRequest, TResponse>): void {
    this.pipelineBehaviors.push(behavior);

    // Sort by priority (highest first)
    this.pipelineBehaviors.sort((a, b) => b.getPriority() - a.getPriority());

    if (this.options.enableLogging) {
      this.logger.debug(
        `Mediator: Registered pipeline behavior with priority: ${behavior.getPriority()}`,
      );
    }
  }

  /**
   * Send a request and get a response
   * @param request - Request to send
   * @returns Promise resolving to Result with response or error
   */
  public async send<TResponse>(
    request: IRequest<TResponse>,
  ): Promise<Result<TResponse, Error>> {
    const context: RequestContext<typeof request, TResponse> = {
      request,
      startTime: Date.now(),
      correlationId: request.correlationId ?? this.generateCorrelationId(),
    };

    try {
      if (this.options.enableLogging) {
        this.logger.debug(
          `Mediator: Processing request: ${request.requestType}`,
          {
            requestId: request.requestId,
            correlationId: context.correlationId,
          },
        );
      }

      // Get handler
      const handler = this.requestHandlers.get(request.requestType);
      if (!handler) {
        const error = new Error(
          `No handler registered for request type: ${request.requestType}`,
        );
        return Result.failure(error);
      }

      // Build pipeline
      const pipeline = this.buildPipeline(request, handler);

      // Execute with timeout
      const timeoutPromise = new Promise<Result<TResponse, Error>>(
        (_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Request timeout after ${this.options.requestTimeout}ms`,
                ),
              ),
            this.options.requestTimeout,
          ),
      );

      const result = await Promise.race([pipeline, timeoutPromise]);

      const processingTime = Date.now() - context.startTime;

      if (this.options.enableLogging) {
        this.logger.debug(
          `Mediator: Request processed: ${request.requestType}`,
          {
            requestId: request.requestId,
            correlationId: context.correlationId,
            processingTimeMs: processingTime,
            success: result.isSuccess,
          },
        );
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const processingTime = Date.now() - context.startTime;

      this.logger.error(
        `Mediator: Request failed: ${request.requestType}`,
        err,
        {
          requestId: request.requestId,
          correlationId: context.correlationId,
          processingTimeMs: processingTime,
        },
      );

      return Result.failure(err);
    }
  }

  /**
   * Publish a notification to all handlers
   * @param notification - Notification to publish
   * @returns Promise that resolves when all handlers complete
   */
  public async publish(
    notification: INotification,
  ): Promise<Result<void, Error>> {
    try {
      if (this.options.enableLogging) {
        this.logger.debug(
          `Mediator: Publishing notification: ${notification.notificationType}`,
          {
            notificationId: notification.notificationId,
            correlationId: notification.correlationId,
          },
        );
      }

      const handlers =
        this.notificationHandlers.get(notification.notificationType) ?? [];

      if (handlers.length === 0) {
        if (this.options.enableLogging) {
          this.logger.debug(
            `Mediator: No handlers found for notification: ${notification.notificationType}`,
          );
        }
        return Result.success(undefined);
      }

      // Process handlers in chunks to limit concurrency
      const chunks = this.chunkArray(
        handlers,
        this.options.maxConcurrentNotifications,
      );
      let totalErrors = 0;

      for (const chunk of chunks) {
        const promises = chunk.map(async (handler) => {
          try {
            await handler.handle(notification);
          } catch (error) {
            totalErrors++;
            this.logger.error(
              `Mediator: Notification handler failed: ${notification.notificationType}`,
              error instanceof Error ? error : new Error(String(error)),
              {
                notificationId: notification.notificationId,
                handlerType: handler.constructor.name,
              },
            );
          }
        });

        await Promise.allSettled(promises);
      }

      if (this.options.enableLogging) {
        this.logger.debug(
          `Mediator: Notification published: ${notification.notificationType}`,
          {
            notificationId: notification.notificationId,
            handlerCount: handlers.length,
            errorCount: totalErrors,
          },
        );
      }

      return Result.success(undefined);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Mediator: Failed to publish notification: ${notification.notificationType}`,
        err,
      );
      return Result.failure(err);
    }
  }

  /**
   * Get registered request types
   * @returns Array of request types
   */
  public getRegisteredRequestTypes(): string[] {
    return Array.from(this.requestHandlers.keys());
  }

  /**
   * Get registered notification types
   * @returns Array of notification types
   */
  public getRegisteredNotificationTypes(): string[] {
    return Array.from(this.notificationHandlers.keys());
  }

  /**
   * Get number of notification handlers for a type
   * @param notificationType - Notification type
   * @returns Number of handlers
   */
  public getNotificationHandlerCount(notificationType: string): number {
    return this.notificationHandlers.get(notificationType)?.length ?? 0;
  }

  /**
   * Build execution pipeline with behaviors
   * @param request - Request to process
   * @param handler - Final handler
   * @returns Pipeline function
   */
  private buildPipeline<TRequest extends IRequest<TResponse>, TResponse>(
    request: TRequest,
    handler: IRequestHandler<TRequest, TResponse>,
  ): Promise<Result<TResponse, Error>> {
    // Get applicable behaviors
    const applicableBehaviors = this.pipelineBehaviors.filter((behavior) =>
      behavior.appliesTo(request.requestType),
    );

    // Build pipeline from right to left
    let pipeline = (req: TRequest) => handler.handle(req);

    for (let i = applicableBehaviors.length - 1; i >= 0; i--) {
      const behavior = applicableBehaviors[i];
      const nextHandler = pipeline;

      pipeline = (req: TRequest) => behavior.handle(req, nextHandler);
    }

    return pipeline(request);
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
   * Generate unique correlation ID
   * @returns Correlation ID
   */
  private generateCorrelationId(): string {
    return `req-${Date.now()}-${++this.requestCounter}`;
  }
}
