// src/infrastructure/services/tool-registry/tool-registry.ts
import { injectable, inject } from 'inversify';
import {
    IToolRegistry,
    ITool,
    ToolParameter
} from '@/domain/services/i-tool-registry.service';
import { LLMToolDefinition } from '@/domain/services/i-llm.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';

@injectable()
export class ToolRegistry implements IToolRegistry {
  private tools: Map<string, ITool> = new Map();
  private logger: ILoggerService;

  constructor(@inject(TYPES.ILoggerService) logger: ILoggerService) {
    this.logger = logger;
    this.logger.info('[ToolRegistry] Initialized.');
    // Tools will now be registered externally, e.g., in inversify.config.ts post-container build.
  }

  async registerTool(tool: ITool): Promise<void> {
    if (this.tools.has(tool.name)) {
      this.logger.warn(`[ToolRegistry] Tool with name "${tool.name}" is being overwritten.`);
    }
    this.tools.set(tool.name, tool);
    this.logger.info(`[ToolRegistry] Tool "${tool.name}" registered.`);
  }

  async getTool(toolName: string): Promise<ITool | undefined> {
    return this.tools.get(toolName);
  }

  async getToolDefinitions(toolNames?: string[]): Promise<LLMToolDefinition[]> {
    const namesToProcess = toolNames && toolNames.length > 0
      ? toolNames
      : Array.from(this.tools.keys());

    const definitions: LLMToolDefinition[] = [];
    for (const name of namesToProcess) {
      const tool = this.tools.get(name);
      if (tool) {
        // Convert ITool.parameters to JSON schema for LLMToolDefinition
        const properties: { [key: string]: any } = {};
        const requiredParams: string[] = [];
        tool.parameters.forEach(param => {
          properties[param.name] = {
            type: param.type,
            description: param.description,
          };
          if (param.schema) { // If a more complex schema is provided
            properties[param.name].schema = param.schema;
          }
          if (param.required) {
            requiredParams.push(param.name);
          }
        });

        definitions.push({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: {
              type: 'object',
              properties: properties,
              required: requiredParams,
            },
          },
        });
      }
    }
    return definitions;
  }

  async executeTool(toolName: string, args: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      this.logger.error(`[ToolRegistry] Tool "${toolName}" not found.`);
      throw new Error(`Tool "${toolName}" not found.`);
    }
    try {
      this.logger.info(`[ToolRegistry] Executing tool "${toolName}" with args: ${JSON.stringify(args)}`);
      // Args from LLM are often stringified JSON
      let parsedArgs = args;
      if (typeof args === 'string') {
        try {
          parsedArgs = JSON.parse(args);
        } catch (e) {
          this.logger.error(`[ToolRegistry] Failed to parse args for tool "${toolName}". Args: ${args}`);
          throw new Error(`Invalid JSON arguments for tool "${toolName}".`);
        }
      }
      return await tool.execute(parsedArgs);
    } catch (error: any) {
      this.logger.error(`[ToolRegistry] Error executing tool "${toolName}": ${error.message}`, error.stack);
      throw error; // Re-throw the original error or a wrapped one
    }
  }
}
