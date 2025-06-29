// src_refactored/core/tools/tool.interface.ts
import { z } from 'zod';

import { ToolError } from '@/domain/common/errors'; // Corrected alias path

import { Result } from '../../shared/result'; // Assuming Result type is in shared

/**
 * Optional context passed to tool execution.
 * Provides the tool with information about the environment or agent calling it.
 */
export interface IToolExecutionContext {
  agentId?: string;
  projectId?: string;
  userId?: string;
  // Other relevant contextual information can be added here.
}

/**
 * Defines the structure for an agent tool.
 *
 * @template InputSchema - A Zod schema defining the input parameters for the tool.
 * @template OutputType - The type of the output returned by the tool's execute method.
 *                       It's recommended this be a `Result<ActualData, ToolError>` for robust error handling.
 */
export interface IAgentTool<
  InputSchema extends z.ZodTypeAny,
  // Using TOutput for the successful data type, ToolError for the error type in Result
  TOutput = unknown, // Changed any to unknown
> {
  /**
   * A unique name for the tool, typically in 'namespace.action' format.
   * Example: "fileSystem.readFile", "codeInterpreter.executePython"
   */
  name: string;

  /**
   * A clear and concise description of what the tool does,
   * its capabilities, and when it should be used by an LLM.
   */
  description: string;

  /**
   * A Zod schema that defines the expected input parameters for the tool.
   * This schema is used by the agent executor to validate inputs before calling the tool.
   */
  parameters: InputSchema;

  /**
   * Executes the tool's functionality with the given parameters.
   *
   * @param params - The validated input parameters, conforming to `z.infer<InputSchema>`.
   * @param executionContext - Optional context providing additional information for the tool's execution.
   * @returns A Promise that resolves to the tool's output.
   *          It is strongly recommended that OutputType is `Result<ActualData, ToolError>`.
   */
  execute(
    params: z.infer<InputSchema>,
    executionContext?: IToolExecutionContext,
  ): Promise<Result<TOutput, ToolError>>; // Recommended to use Result for output
}

/**
 * Token for IAgentTool, can be used for Dependency Injection if tools are registered this way.
 * A more common pattern might be a ToolRegistry that holds instances of IAgentTool.
 */
export const IAgentToolToken = Symbol('IAgentTool');

/**
 * Example of a simple tool's parameter schema and output type.
 * This is not part of the interface itself but demonstrates usage.
 *
 * const exampleToolParams = z.object({
 *   message: z.string().describe("The message to echo."),
 * });
 * type ExampleToolOutput = { echoedMessage: string };
 *
 * // class ExampleEchoTool implements IAgentTool<typeof exampleToolParams, ExampleToolOutput> { ... }
 */
