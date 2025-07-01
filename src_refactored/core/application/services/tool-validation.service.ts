import { injectable, inject } from 'inversify';
import { z } from 'zod';

import { IToolRegistryService } from '@/core/application/ports/services/i-tool-registry.service'; // Removed TOOL_REGISTRY_SERVICE_TOKEN
import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { ToolError } from '@/core/domain/common/errors';
import { ExecutionHistoryEntry } from '@/core/domain/job/job-processing.types';
import { LanguageModelMessageToolCall } from '@/core/ports/adapters/llm-adapter.types';
import { IToolExecutionContext, IAgentTool } from '@/core/tools/tool.interface';

import { TYPES } from '@/infrastructure/ioc/types'; // Added import for TYPES

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

    const toolInstance = this.toolRegistryService.getTool(toolName);
    if (!toolInstance) {
      return this._createToolNotFoundError(toolName, timestamp, executionContext.jobId);
    }

    const parsedArgs = this._parseToolArguments(toolCall, toolName, timestamp, executionContext.jobId);
    if (parsedArgs.error) {
      return parsedArgs.error;
    }

    const validationResult = toolInstance.parameters.safeParse(parsedArgs.value);
    if (!validationResult.success) {
      return this._createToolValidationError(toolName, timestamp, validationResult.error, parsedArgs.value, executionContext.jobId);
    }

    this.logger.info(`Tool call validated: ${toolName} with args: ${JSON.stringify(validationResult.data)}`, {
      toolName,
      jobId: executionContext.jobId,
    });
    return this._executeTool(toolInstance, validationResult.data, timestamp, executionContext);
  }

  private _createToolNotFoundError(toolName: string, timestamp: Date, jobId: string): ExecutionHistoryEntry {
    const toolNotFoundError = new ToolError(`Tool '${toolName}' not found.`, toolName, undefined, false);
    this.logger.error(toolNotFoundError.message, { toolName, jobId });
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
        toolName,
        parseError,
        true,
      );
      this.logger.error(parsingToolError.message, { toolName, args: toolCall.function.arguments, jobId });
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
    jobId: string,
  ): ExecutionHistoryEntry {
    const validationToolError = new ToolError(
      `Argument validation failed for tool '${toolName}'.`,
      toolName,
      validationError,
      true,
    );
    this.logger.error(validationToolError.message, { toolName, issues: validationError.flatten(), jobId });
    return { timestamp, type: 'tool_error', name: toolName, error: validationToolError, params: parsedArgs, isCritical: false };
  }

  private async _executeTool(
    toolInstance: IAgentTool,
    validatedArgs: unknown,
    timestamp: Date,
    executionContext: IToolExecutionContext,
  ): Promise<ExecutionHistoryEntry> {
    const toolName = toolInstance.name;
    try {
      const toolExecResult = await toolInstance.execute(validatedArgs, executionContext);
      if (toolExecResult.isError()) {
        const toolErrorFromTool = toolExecResult.error;
        this.logger.error(`Tool '${toolName}' execution failed: ${toolErrorFromTool.message}`, {
          toolError: toolErrorFromTool,
          jobId: executionContext.jobId,
        });
        return {
          timestamp,
          type: 'tool_error',
          name: toolName,
          params: validatedArgs,
          error: toolErrorFromTool,
          isCritical: !toolErrorFromTool.isRecoverable,
        };
      }
      this.logger.info(`Tool '${toolName}' executed successfully.`, { result: toolExecResult.value, jobId: executionContext.jobId });
      return { timestamp, type: 'tool_result', name: toolName, params: validatedArgs, result: toolExecResult.value };
    } catch (error: unknown) {
      const execError = error instanceof Error ? error : new Error(String(error));
      const unexpectedToolError = new ToolError(
        `Unexpected error during tool '${toolName}' execution: ${execError.message}`,
        toolName,
        execError,
        false,
      );
      this.logger.error(unexpectedToolError.message, { error: unexpectedToolError, jobId: executionContext.jobId });
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
