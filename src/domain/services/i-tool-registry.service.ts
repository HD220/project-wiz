// src/domain/services/i-tool-registry.service.ts
import { LLMToolDefinition } from './i-llm.service'; // Re-use for structure

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'; // Basic types
  description: string;
  required: boolean;
  schema?: object; // For complex object/array types, a JSON schema
}

export interface ITool {
  /** The unique name of the tool, matching LLMToolDefinition.function.name */
  name: string;
  /** A human-readable description of what the tool does. */
  description: string;
  /** Input parameters the tool accepts, conforming to JSON schema for LLM consumption. */
  parameters: ToolParameter[]; // Simplified for now, could be full JSON schema

  /**
   * Executes the tool with the given arguments.
   * @param args A JSON object (or stringified JSON) containing arguments for the tool,
   *             matching the tool's parameter schema.
   * @returns A Promise that resolves to any serializable result from the tool.
   *          It's recommended this result is a JSON object or a string.
   */
  execute(args: any): Promise<any>; // args will typically be an object after JSON.parse
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
   * @param toolNames An array of tool names to get definitions for. If empty or undefined,
   *                  may return all registered tool definitions (implementation dependent).
   * @returns An array of LLMToolDefinition objects.
   */
  getToolDefinitions(toolNames?: string[]): Promise<LLMToolDefinition[]>;

  /**
   * Executes a registered tool by its name with the provided arguments.
   * @param toolName The name of the tool to execute.
   * @param args Arguments for the tool, typically a JSON object or stringified JSON.
   * @returns A promise that resolves to the execution result of the tool.
   * @throws Error if the tool is not found or if execution fails.
   */
  executeTool(toolName: string, args: any): Promise<any>;
}
