// src/infrastructure/services/tool-registry/tool-registry.ts
import { injectable, inject } from 'inversify';
import {
    IToolRegistry,
    ITool,
    // ToolParameter is removed from IToolRegistry interface file
} from '@/domain/services/i-tool-registry.service';
import { LLMToolDefinition } from '@/domain/services/i-llm.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

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
        // Convert Zod schema to JSON schema
        // The options for zodToJsonSchema can be customized if needed
        const jsonSchema = zodToJsonSchema(tool.parametersSchema, {
            // name: tool.name, // Optional: provide a name for the schema definition
            // $refStrategy: "none", // Use "none" to inline all definitions, good for simple LLM calls
            // errorMessages: true, // Include Zod error messages in the JSON schema (good for debugging)
        });

        // The output of zodToJsonSchema is a JSON schema document.
        // For LLM function calling, we need the part that describes the parameters object.
        // If tool.parametersSchema is a z.object(), jsonSchema will be that object schema.
        definitions.push({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: jsonSchema as object, // Cast, as LLMToolDefinition expects a generic 'object'
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
      let parsedArgs = args;
      if (typeof args === 'string') {
        try {
          parsedArgs = JSON.parse(args);
        } catch (e: any) {
          this.logger.error(`[ToolRegistry] Failed to parse JSON arguments for tool "${toolName}". Args: ${args}, Error: ${e.message}`);
          throw new Error(`Invalid JSON arguments for tool "${toolName}". Input was not valid JSON.`);
        }
      }

      // Validate args with Zod schema
      const validationResult = tool.parametersSchema.safeParse(parsedArgs);
      if (!validationResult.success) {
        // You can format Zod errors for better readability if needed
        const formattedErrors = validationResult.error.format();
        this.logger.error(`[ToolRegistry] Invalid arguments for tool "${toolName}". Errors: ${JSON.stringify(formattedErrors)}`);
        throw new Error(`Invalid arguments provided for tool "${toolName}". Details: ${JSON.stringify(formattedErrors)}`);
      }

      const validatedArgs = validationResult.data;
      this.logger.debug(`[ToolRegistry] Validated args for tool "${toolName}": ${JSON.stringify(validatedArgs)}`);

      return await tool.execute(validatedArgs); // Pass validated (and potentially transformed/defaulted) args
    } catch (error: any) {
      // Catch errors from tool.execute() or Zod validation if not caught above (though safeParse should prevent Zod throwing directly)
      this.logger.error(`[ToolRegistry] Error during execution of tool "${toolName}": ${error.message}`, error.stack);
      throw error;
    }
  }
}
