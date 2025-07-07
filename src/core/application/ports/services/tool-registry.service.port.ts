import { z } from 'zod';

import { ApplicationError } from '@/core/application/common/common-application.errors';
import { IAgentTool } from '@/core/tools/tool.interface';




/**
 * @class ToolNotFoundError
 * @description Custom error for when a requested tool is not found in the registry.
 * Inherits from ApplicationError.
 */
export class ToolNotFoundError extends ApplicationError {
  constructor(toolName: string) {
    super(`Tool '${toolName}' not found in registry.`);
    this.name = 'ToolNotFoundError';
  }
}

/**
 * @interface IToolRegistryService
 * @description Defines the contract for a service that manages the registration
 * and retrieval of IAgentTool instances.
 */
export interface IToolRegistryService {
  /**
   * Registers a new tool with the registry.
   * Depending on implementation, this might be called during application startup
   * or dynamically.
   *
   * @param {IAgentTool} tool - The tool instance to register.
   */
  registerTool(tool: IAgentTool<z.ZodTypeAny, unknown>): Promise<void>;

  /**
   * Retrieves a tool by its unique name.
   *
   * @param {string} toolName - The unique name of the tool to retrieve.
   * @returns {IAgentTool<z.ZodTypeAny, unknown> | undefined} The tool instance, or undefined if not found.
   */
  getTool(toolName: string): IAgentTool<z.ZodTypeAny, unknown> | undefined;

  /**
   * Lists all tools currently registered.
   *
   * @returns {IAgentTool<z.ZodTypeAny, unknown>[]} An array of IAgentTool instances.
   */
  listTools(): IAgentTool<z.ZodTypeAny, unknown>[];
}
