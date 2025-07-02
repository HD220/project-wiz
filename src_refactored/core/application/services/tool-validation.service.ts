import { injectable, inject } from 'inversify';
import { z } from 'zod';

import { IToolRegistryService } from '@/core/application/ports/services/i-tool-registry.service';
import { ApplicationError } from '@/core/application/common/errors'; // Added ApplicationError
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { ToolError, ToolNotFoundError } from '@/core/domain/common/errors'; // Added ToolNotFoundError
import { ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext, IAgentTool } from '@/core/tools/tool.interface';
import { Result, ok, error as resultError, isSuccess, isError } from '@/shared/result'; // Added Result and type guards

import { TYPES } from '@/infrastructure/ioc/types';

@injectable()
export class ToolValidationService {
  constructor(
    @inject(TYPES.IToolRegistryService) private readonly toolRegistryService: IToolRegistryService, // Corrected token
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async processAndValidateSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    executionContext: IToolExecutionContext,
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolCall.function.name;
    const timestamp = new Date();

    const toolResult = await this.toolRegistryService.getTool(toolName);

    if (isError(toolResult)) {
      const serviceError = toolResult.error; // Type is ApplicationError | ToolNotFoundError
      this.logger.error(
        `[ToolValidationService] Error fetching tool '${toolName}': ${serviceError.message}`,
        serviceError, // Pass the full error object
        { toolName, jobId: executionContext.jobId ?? 'N/A', serviceOperation: 'getTool' }
      );
      const isRecoverable = (serviceError instanceof ToolError && serviceError.isRecoverable) || (serviceError instanceof ApplicationError); // ApplicationErrors might be considered recoverable for the agent's context
      const finalToolError = serviceError instanceof ToolError ? serviceError : new ToolError(serviceError.message, toolName, serviceError, isRecoverable);
      return { timestamp, type: 'tool_error', name: toolName, error: finalToolError, isCritical: !finalToolError.isRecoverable };
    }

    // toolResult is Success<IAgentTool<z.ZodTypeAny, unknown>>
    const toolInstance = toolResult.value;
    // No need to check for !toolInstance if getTool() guarantees a tool or an error in Result,
    // which it should as per IToolRegistryService returning Promise<Result<IAgentTool<...>, ...>>
    // If toolResult.value could be null/undefined, the IToolRegistryService interface or its impl is problematic.
    // For now, assuming toolResult.value is indeed IAgentTool if isSuccess(toolResult) is true.

    const parsedArgsResult = this._parseToolArguments(toolCall, toolName, timestamp, executionContext.jobId ?? 'N/A');
    if (parsedArgsResult.error) {
      return parsedArgsResult.error;
    }

    const validationResult = toolInstance.parameters.safeParse(parsedArgsResult.value);
    if (!validationResult.success) {
      return this._createToolValidationError(toolName, timestamp, validationResult.error, parsedArgsResult.value, executionContext.jobId);
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, {
      toolName,
      jobId: executionContext.jobId,
    });
    // Ensure toolInstance is passed with the correct type to _executeTool
    return this._executeTool(toolInstance as IAgentTool<z.ZodTypeAny, unknown>, validationResult.data, timestamp, executionContext);
  }

  // This specific method might become redundant or less used if ToolNotFoundError is handled from toolRegistryService.getTool's Result
  private _createToolNotFoundError(toolName: string, timestamp: Date, jobId: string): ExecutionHistoryEntry {
    const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, toolName, undefined, false);
    this.logger.error(toolNotFoundError.message, toolNotFoundError, { toolName, jobId: jobId ?? 'N/A' }); // Pass error as second arg, handle potentially undefined jobId
    return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
  }

  private _parseToolArguments(
    toolCall: LanguageModelMessageToolCall,
    toolName: string,
    timestamp: Date,
    jobId: string, // Already handled as potentially 'N/A' when calling this
  ): { value?: unknown; error?: ExecutionHistoryEntry } {
    try {
      return { value: JSON.parse(toolCall.function.arguments) };
    } catch (error: unknown) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      const parsingToolError = new ToolError(
        `Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`,
        toolName,
        parseError,
        true, // Argument parsing errors are generally recoverable by the agent
      );
      this.logger.error(
        parsingToolError.message,
        parsingToolError,
        // Ensure all potentially undefined properties from context are handled if logger meta is strict
        {
          toolName: toolName, // string
          originalArgs: toolCall.function.arguments, // string
          jobId: jobId, // string (already pre-processed with ?? 'N/A')
          service: 'ToolValidationService',
          operation: '_parseToolArguments'
        }
      );
      return {
        error: {
          timestamp,
          type: 'tool_error',
          name: toolName,
          error: parsingToolError,
          params: { originalArgs: toolCall.function.arguments },
          isCritical: false,
        },
      };
    }
  }

  private _createToolValidationError(
    toolName: string,
    timestamp: Date,
    validationError: z.ZodError,
    parsedArgs: unknown,
    jobId: string | undefined,
  ): ExecutionHistoryEntry {
    const validationToolError = new ToolError(
      `Argument validation failed for tool '${toolName}'.`,
      toolName,
      validationError,
      true,
    );
    this.logger.error(
      validationToolError.message,
      validationError,
      {
        toolName: toolName, // string
        issues: validationError.flatten().fieldErrors,
        originalArgs: parsedArgs as object,
        jobId: jobId ?? 'N/A', // Handle undefined jobId
        service: 'ToolValidationService',
        operation: '_createToolValidationError',
      },
    );
    return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false };
  }

  private async _executeTool(
    toolInstance: IAgentTool<z.ZodTypeAny, unknown>,
    validatedArgs: unknown,
    timestamp: Date,
    executionContext: IToolExecutionContext,
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolInstance.name;
    const currentJobId = executionContext.jobId ?? 'N/A'; // Ensure string for logger
    try {
      const toolExecResult = await toolInstance.execute(validatedArgs, executionContext);

      if (isError(toolExecResult)) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(
          `Tool '${toolName}' execution failed: ${toolErrorFromTool.message}`,
          toolErrorFromTool,
          { toolName: toolName, jobId: currentJobId, service: 'ToolValidationService', operation: '_executeTool' }
        );
        return {
          timestamp,
          type: 'tool_error',
          name: toolName,
          params: validatedArgs,
          error: toolErrorFromTool,
          isCritical: !toolErrorFromTool.isRecoverable,
        };
      }

      this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult.value, jobId: currentJobId });
      return { timestamp, type: 'tool_result', name: toolName, params: validatedArgs, result: toolExecResult.value };
    } catch (error: unknown) {
      const execError = error instanceof Error ? error : new Error(String(error));
      const unexpectedToolError = new ToolError(
        `Unexpected error during tool '${toolName}' execution: ${execError.message}`,
        toolName,
        execError,
        false,
      );
      this.logger.error(
        unexpectedToolError.message,
        unexpectedToolError,
        { toolName: toolName, jobId: currentJobId, service: 'ToolValidationService', operation: '_executeTool_catch' }
        );
      return {
        timestamp,
        type: 'tool_error',
        name: toolName,
        error: unexpectedToolError,
        params: validatedArgs,
        isCritical: true,
      };
    }
  }
}
