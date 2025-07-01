import { z } from 'zod';

import { IAgentTool } from '@/core/tools/tool.interface';

import { ApplicationError } from '@/application/common/errors';

import { Result } from '@/shared/result';

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
   * @returns {Promise<Result<void, ApplicationError>>} A promise that resolves with
   *          a Result. On success, it's void. On failure, it contains an ApplicationError.
   */
  registerTool(tool: IAgentTool<z.ZodTypeAny, unknown>): Promise<Result<void, ApplicationError>>;

  /**
   * Retrieves a tool by its unique name.
   *
   * @param {string} toolName - The unique name of the tool to retrieve.
   * @returns {Promise<Result<IAgentTool<z.ZodTypeAny, unknown>, ToolNotFoundError | ApplicationError>>}
   *          A promise that resolves with a Result.
   *          On success, it contains the IAgentTool instance.
   *          On failure, it contains a ToolNotFoundError or a generic ApplicationError.
   */
  getTool(toolName: string): Promise<Result<IAgentTool<z.ZodTypeAny, unknown>, ToolNotFoundError | ApplicationError>>;

  /**
   * Lists all tools currently registered.
   *
   * @returns {Promise<Result<IAgentTool<z.ZodTypeAny, unknown>[], ApplicationError>>}
   *          A promise that resolves with a Result.
   *          On success, it contains an array of IAgentTool instances.
   *          On failure, it contains an ApplicationError.
   */
  listTools(): Promise<Result<IAgentTool<z.ZodTypeAny, unknown>[], ApplicationError>>;
}
