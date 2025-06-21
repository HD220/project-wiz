// src/domain/services/i-tool-registry.service.ts
import { z } from 'zod'; // Added
import { LLMToolDefinition } from './i-llm.service'; // Re-use for structure

// ToolParameter interface is REMOVED

export interface ITool {
  /** The unique name of the tool, matching LLMToolDefinition.function.name */
  name: string;
  /** A human-readable description of what the tool does. */
  description: string;
  /**
   * Zod schema defining the structure and types of the arguments
   * the tool's `execute` method expects.
   */
  parametersSchema: z.ZodObject<any, any, any>; // CHANGED from ToolParameter[]

  /**
   * Executes the tool with the given arguments.
   * @param args An object containing arguments for the tool,
   *             which should be validated against `parametersSchema` by the ToolRegistry.
   * @returns A Promise that resolves to any serializable result from the tool.
   *          It's recommended this result is a JSON object or a string.
   */
  execute(args: any): Promise<any>; // args type will be z.infer<typeof this.parametersSchema> in implementing class
}

export interface IToolRegistry {
  /**
   * Registers a new tool or updates an existing one.
   * @param tool The tool instance to register.
   */
  registerTool(tool: ITool): Promise<void>;

  /**
   * Retrieves a tool instance by its name.
   * @param toolName The name of the tool to retrieve.
   * @returns The ITool instance or undefined if not found.
   */
  getTool(toolName: string): Promise<ITool | undefined>;

  /**
   * Retrieves the LLM-compatible definitions for a list of tool names.
   * The implementation will convert Zod schemas to JSON schemas.
   * @param toolNames An array of tool names to get definitions for. If empty or undefined,
   *                  may return all registered tool definitions (implementation dependent).
   * @returns An array of LLMToolDefinition objects.
   */
  getToolDefinitions(toolNames?: string[]): Promise<LLMToolDefinition[]>;

  /**
   * Executes a registered tool by its name with the provided arguments.
   * The implementation will validate args against the tool's Zod schema.
   * @param toolName The name of the tool to execute.
   * @param args Arguments for the tool, typically a JSON object or stringified JSON from LLM.
   * @returns A promise that resolves to the execution result of the tool.
   * @throws Error if the tool is not found, args are invalid, or if execution fails.
   */
  executeTool(toolName: string, args: any): Promise<any>;
}
