import { Logger } from "./logger";
import { Result } from "../abstractions/result.type";
import { IRequest, IPipelineBehavior } from "./mediator";

/**
 * Pipeline step interface
 * Defines a single step in a processing pipeline
 *
 * @template TInput - Type of input
 * @template TOutput - Type of output
 */
export interface IPipelineStep<TInput, TOutput> {
  /**
   * Execute the pipeline step
   * @param input - Input data
   * @param context - Pipeline context
   * @returns Promise resolving to Result with output or error
   */
  execute(
    input: TInput,
    context: PipelineContext,
  ): Promise<Result<TOutput, Error>>;

  /**
   * Get step name for logging and identification
   * @returns Step name
   */
  getName(): string;

  /**
   * Get step priority (higher = executed first)
   * @returns Priority value
   */
  getPriority(): number;

  /**
   * Check if step should be executed for given input
   * @param input - Input to check
   * @returns True if step should execute
   */
  shouldExecute(input: TInput): boolean;
}

/**
 * Pipeline context for passing data between steps
 */
export interface PipelineContext {
  /**
   * Unique pipeline execution ID
   */
  readonly executionId: string;

  /**
   * Start time of pipeline execution
   */
  readonly startTime: number;

  /**
   * Correlation ID for tracking
   */
  readonly correlationId?: string;

  /**
   * Shared data between pipeline steps
   */
  readonly data: Map<string, unknown>;

  /**
   * Execution metadata
   */
  readonly metadata: Record<string, unknown>;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult<T> {
  /**
   * Final result data
   */
  readonly result: T;

  /**
   * Steps that were executed
   */
  readonly executedSteps: string[];

  /**
   * Steps that were skipped
   */
  readonly skippedSteps: string[];

  /**
   * Total execution time in milliseconds
   */
  readonly executionTimeMs: number;

  /**
   * Pipeline context
   */
  readonly context: PipelineContext;
}

/**
 * Pipeline configuration options
 */
export interface PipelineOptions {
  /**
   * Maximum execution timeout (ms)
   */
  readonly timeout?: number;

  /**
   * Continue execution on step failure
   */
  readonly continueOnError?: boolean;

  /**
   * Enable step execution logging
   */
  readonly enableLogging?: boolean;

  /**
   * Maximum number of concurrent steps
   */
  readonly maxConcurrentSteps?: number;
}

/**
 * Pipeline builder for creating processing pipelines
 * Supports sequential and parallel step execution
 */
export class Pipeline<TInput, TOutput> {
  private readonly steps: IPipelineStep<any, any>[] = [];
  private readonly logger: Logger;
  private readonly options: Required<PipelineOptions>;
  private executionCounter = 0;

  constructor(logger: Logger, options: PipelineOptions = {}) {
    this.logger = logger;
    this.options = {
      timeout: options.timeout ?? 30000,
      continueOnError: options.continueOnError ?? false,
      enableLogging: options.enableLogging ?? true,
      maxConcurrentSteps: options.maxConcurrentSteps ?? 5,
    };
  }

  /**
   * Add a step to the pipeline
   * @param step - Pipeline step to add
   * @returns Pipeline instance for chaining
   */
  public addStep<TStepInput, TStepOutput>(
    step: IPipelineStep<TStepInput, TStepOutput>,
  ): Pipeline<TInput, TOutput> {
    this.steps.push(step);

    // Sort steps by priority (highest first)
    this.steps.sort((a, b) => b.getPriority() - a.getPriority());

    if (this.options.enableLogging) {
      this.logger.debug(`Pipeline: Added step: ${step.getName()}`, {
        priority: step.getPriority(),
        totalSteps: this.steps.length,
      });
    }

    return this;
  }

  /**
   * Execute the pipeline
   * @param input - Initial input data
   * @param correlationId - Optional correlation ID
   * @returns Promise resolving to Result with pipeline result or error
   */
  public async execute(
    input: TInput,
    correlationId?: string,
  ): Promise<Result<PipelineResult<TOutput>, Error>> {
    const context: PipelineContext = {
      executionId: this.generateExecutionId(),
      startTime: Date.now(),
      correlationId,
      data: new Map(),
      metadata: {},
    };

    try {
      if (this.options.enableLogging) {
        this.logger.debug("Pipeline: Starting execution", {
          executionId: context.executionId,
          correlationId: context.correlationId,
          stepCount: this.steps.length,
        });
      }

      // Execute pipeline with timeout
      const timeoutPromise = new Promise<
        Result<PipelineResult<TOutput>, Error>
      >((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                `Pipeline execution timeout after ${this.options.timeout}ms`,
              ),
            ),
          this.options.timeout,
        ),
      );

      const executionPromise = this.executeSteps(input, context);
      const result = await Promise.race([executionPromise, timeoutPromise]);

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const executionTime = Date.now() - context.startTime;

      this.logger.error("Pipeline: Execution failed", err, {
        executionId: context.executionId,
        correlationId: context.correlationId,
        executionTimeMs: executionTime,
      });

      return Result.failure(err);
    }
  }

  /**
   * Get pipeline step count
   * @returns Number of steps
   */
  public getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Get pipeline step names
   * @returns Array of step names
   */
  public getStepNames(): string[] {
    return this.steps.map((step) => step.getName());
  }

  /**
   * Create a copy of the pipeline
   * @returns New pipeline instance with same steps
   */
  public clone(): Pipeline<TInput, TOutput> {
    const cloned = new Pipeline<TInput, TOutput>(this.logger, this.options);
    for (const step of this.steps) {
      cloned.addStep(step);
    }
    return cloned;
  }

  /**
   * Execute all pipeline steps
   * @param input - Initial input
   * @param context - Pipeline context
   * @returns Pipeline result
   */
  private async executeSteps(
    input: TInput,
    context: PipelineContext,
  ): Promise<Result<PipelineResult<TOutput>, Error>> {
    const executedSteps: string[] = [];
    const skippedSteps: string[] = [];
    let currentData: unknown = input;

    for (const step of this.steps) {
      try {
        if (!step.shouldExecute(currentData)) {
          skippedSteps.push(step.getName());

          if (this.options.enableLogging) {
            this.logger.debug(`Pipeline: Skipping step: ${step.getName()}`, {
              executionId: context.executionId,
              reason: "shouldExecute returned false",
            });
          }

          continue;
        }

        if (this.options.enableLogging) {
          this.logger.debug(`Pipeline: Executing step: ${step.getName()}`, {
            executionId: context.executionId,
            stepIndex: executedSteps.length + skippedSteps.length,
          });
        }

        const stepStartTime = Date.now();
        const stepResult = await step.execute(currentData, context);
        const stepExecutionTime = Date.now() - stepStartTime;

        if (stepResult.isSuccess) {
          currentData = stepResult.value;
          executedSteps.push(step.getName());

          if (this.options.enableLogging) {
            this.logger.debug(`Pipeline: Step completed: ${step.getName()}`, {
              executionId: context.executionId,
              executionTimeMs: stepExecutionTime,
            });
          }
        } else {
          const error = stepResult.error;

          this.logger.error(`Pipeline: Step failed: ${step.getName()}`, error, {
            executionId: context.executionId,
            executionTimeMs: stepExecutionTime,
          });

          if (!this.options.continueOnError) {
            return Result.failure(error);
          }

          skippedSteps.push(step.getName());
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        this.logger.error(`Pipeline: Step exception: ${step.getName()}`, err, {
          executionId: context.executionId,
        });

        if (!this.options.continueOnError) {
          return Result.failure(err);
        }

        skippedSteps.push(step.getName());
      }
    }

    const executionTime = Date.now() - context.startTime;

    const result: PipelineResult<TOutput> = {
      result: currentData as TOutput,
      executedSteps,
      skippedSteps,
      executionTimeMs: executionTime,
      context,
    };

    if (this.options.enableLogging) {
      this.logger.debug("Pipeline: Execution completed", {
        executionId: context.executionId,
        executedSteps: executedSteps.length,
        skippedSteps: skippedSteps.length,
        executionTimeMs: executionTime,
      });
    }

    return Result.success(result);
  }

  /**
   * Generate unique execution ID
   * @returns Execution ID
   */
  private generateExecutionId(): string {
    return `pipe-${Date.now()}-${++this.executionCounter}`;
  }
}

/**
 * Common pipeline behaviors for request processing
 */
export namespace PipelineBehaviors {
  /**
   * Logging pipeline behavior
   * Logs request/response data for debugging
   */
  export class LoggingBehavior<TRequest extends IRequest<TResponse>, TResponse>
    implements IPipelineBehavior<TRequest, TResponse>
  {
    constructor(
      private readonly logger: Logger,
      private readonly logRequestData: boolean = false,
      private readonly logResponseData: boolean = false,
    ) {}

    public async handle(
      request: TRequest,
      next: (request: TRequest) => Promise<Result<TResponse, Error>>,
    ): Promise<Result<TResponse, Error>> {
      const startTime = Date.now();

      this.logger.debug(
        `Pipeline: Processing request: ${request.requestType}`,
        {
          requestId: request.requestId,
          correlationId: request.correlationId,
          ...(this.logRequestData && { requestData: request }),
        },
      );

      try {
        const result = await next(request);
        const executionTime = Date.now() - startTime;

        if (result.isSuccess) {
          this.logger.debug(
            `Pipeline: Request completed: ${request.requestType}`,
            {
              requestId: request.requestId,
              correlationId: request.correlationId,
              executionTimeMs: executionTime,
              ...(this.logResponseData && { responseData: result.value }),
            },
          );
        } else {
          this.logger.error(
            `Pipeline: Request failed: ${request.requestType}`,
            result.error,
            {
              requestId: request.requestId,
              correlationId: request.correlationId,
              executionTimeMs: executionTime,
            },
          );
        }

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        const err = error instanceof Error ? error : new Error(String(error));

        this.logger.error(
          `Pipeline: Request exception: ${request.requestType}`,
          err,
          {
            requestId: request.requestId,
            correlationId: request.correlationId,
            executionTimeMs: executionTime,
          },
        );

        return Result.failure(err);
      }
    }

    public getPriority(): number {
      return 1000; // High priority for logging
    }

    public appliesTo(requestType: string): boolean {
      return true; // Apply to all requests
    }
  }

  /**
   * Validation pipeline behavior
   * Validates requests before processing
   */
  export class ValidationBehavior<
    TRequest extends IRequest<TResponse>,
    TResponse,
  > implements IPipelineBehavior<TRequest, TResponse>
  {
    constructor(
      private readonly validator: (
        request: TRequest,
      ) => Promise<Result<void, Error>>,
      private readonly logger?: Logger,
    ) {}

    public async handle(
      request: TRequest,
      next: (request: TRequest) => Promise<Result<TResponse, Error>>,
    ): Promise<Result<TResponse, Error>> {
      // Validate request
      const validationResult = await this.validator(request);

      if (validationResult.isFailure) {
        this.logger?.warn(
          `Pipeline: Request validation failed: ${request.requestType}`,
          {
            requestId: request.requestId,
            error: validationResult.error.message,
          },
        );

        return Result.failure(validationResult.error);
      }

      // Continue to next handler
      return await next(request);
    }

    public getPriority(): number {
      return 900; // High priority for validation
    }

    public appliesTo(requestType: string): boolean {
      return true; // Apply to all requests by default
    }
  }

  /**
   * Performance monitoring pipeline behavior
   * Monitors request execution time and logs slow requests
   */
  export class PerformanceMonitoringBehavior<
    TRequest extends IRequest<TResponse>,
    TResponse,
  > implements IPipelineBehavior<TRequest, TResponse>
  {
    constructor(
      private readonly logger: Logger,
      private readonly slowRequestThresholdMs: number = 1000,
    ) {}

    public async handle(
      request: TRequest,
      next: (request: TRequest) => Promise<Result<TResponse, Error>>,
    ): Promise<Result<TResponse, Error>> {
      const startTime = performance.now();

      try {
        const result = await next(request);
        const executionTime = performance.now() - startTime;

        if (executionTime > this.slowRequestThresholdMs) {
          this.logger.warn(
            `Pipeline: Slow request detected: ${request.requestType}`,
            {
              requestId: request.requestId,
              correlationId: request.correlationId,
              executionTimeMs: Math.round(executionTime),
              threshold: this.slowRequestThresholdMs,
            },
          );
        }

        return result;
      } catch (error) {
        const executionTime = performance.now() - startTime;

        this.logger.error(
          `Pipeline: Request performance monitoring error: ${request.requestType}`,
          error instanceof Error ? error : new Error(String(error)),
          {
            requestId: request.requestId,
            correlationId: request.correlationId,
            executionTimeMs: Math.round(executionTime),
          },
        );

        throw error;
      }
    }

    public getPriority(): number {
      return 100; // Low priority for monitoring
    }

    public appliesTo(requestType: string): boolean {
      return true; // Apply to all requests
    }
  }
}
