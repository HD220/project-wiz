import { injectable, inject } from 'inversify';
import { z } from 'zod';

import { APPLICATION_TYPES } from '@/core/application/common/types';
import { IToolRegistryService } from '@/core/application/ports/services/tool-registry.service.port';
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/logger.port';
import { ToolError } from '@/core/domain/common/common-domain.errors';
import { ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext, IAgentTool } from '@/core/tools/tool.interface';


@injectable()
export class ToolValidationService {
  constructor(
    @inject(APPLICATION_TYPES.IToolRegistryService) private readonly toolRegistryService: IToolRegistryService,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  public async processAndValidateSingleToolCall(
    toolCall: LanguageModelMessageToolCall,
    executionContext: IToolExecutionContext,
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolCall.function.name;
    const timestamp = new Date();

    const toolResult = await this.toolRegistryService.getTool(toolName);

    if (!toolResult) {
      const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, { toolName, isRecoverable: false });
      this.logger.error(toolNotFoundError.message, toolNotFoundError, { toolName, jobId: executionContext.jobId ?? 'N/A' });
      return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
    }

    const toolInstance = toolResult;

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
    return this._executeTool(toolInstance as IAgentTool<z.ZodTypeAny, unknown>, validationResult.data, timestamp, executionContext);
  }

  private _createToolNotFoundError(toolName: string, timestamp: Date, jobId: string): ExecutionHistoryEntry {
    const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, { toolName, isRecoverable: false });
    this.logger.error(toolNotFoundError.message, toolNotFoundError, { toolName, jobId: jobId ?? 'N/A' });
    return { timestamp, type: 'tool_error', name: toolName, error: toolNotFoundError, isCritical: true };
  }

  private _parseToolArguments(
    toolCall: LanguageModelMessageToolCall,
    toolName: string,
    timestamp: Date,
    jobId: string,
  ): { value?: unknown; error?: ExecutionHistoryEntry } {
    try {
      return { value: JSON.parse(toolCall.function.arguments) };
    } catch (error: unknown) {
      const parseError = error instanceof Error ? error : new Error(String(error));
      const parsingToolError = new ToolError(
        `Failed to parse arguments for tool '${toolName}'. Error: ${parseError.message}`,
        { toolName, originalError: parseError, isRecoverable: true },
      );
      this.logger.error(
        parsingToolError.message,
        parsingToolError,
        {
          toolName: toolName,
          originalArgs: toolCall.function.arguments,
          jobId: jobId,
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
      { toolName, originalError: validationError, isRecoverable: true },
    );
    this.logger.error(
      validationToolError.message,
      validationError,
      {
        toolName: toolName,
        issues: validationError.flatten().fieldErrors,
        originalArgs: parsedArgs as object,
        jobId: jobId ?? 'N/A',
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
    const currentJobId = executionContext.jobId ?? 'N/A';
    try {
      const toolExecResult = await toolInstance.execute(validatedArgs, executionContext);
      return this._handleToolExecutionResult(toolExecResult, toolName, timestamp, validatedArgs, currentJobId);
    } catch (error: unknown) {
      return this._handleUnexpectedToolExecutionError(error, toolName, timestamp, validatedArgs, currentJobId);
    }
  }

  private _handleUnexpectedToolExecutionError(
    error: unknown,
    toolName: string,
    timestamp: Date,
    validatedArgs: unknown,
    currentJobId: string,
  ): ExecutionHistoryEntry {
    const execError = error instanceof Error ? error : new Error(String(error));
    const unexpectedToolError = new ToolError(
      `Unexpected error during tool '${toolName}' execution: ${execError.message}`,
      { toolName, originalError: execError, isRecoverable: false },
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

  private _handleToolExecutionResult(
    toolExecResult: unknown,
    toolName: string,
    timestamp: Date,
    validatedArgs: unknown,
    currentJobId: string,
  ): ExecutionHistoryEntry {
    this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult, jobId: currentJobId });
    return { timestamp, type: 'tool_result', name: toolName, params: validatedArgs, result: toolExecResult };
  }
}
