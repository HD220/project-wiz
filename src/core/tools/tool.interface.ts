// src/core/tools/tool.interface.ts
import { z } from 'zod';

export interface IAgentTool<TParams extends z.ZodTypeAny = z.ZodTypeAny, TOutput = any> {
  /** Unique name for the tool, e.g., 'fileSystem.readFile' or 'taskManager.saveJob' */
  name: string;
  /** Description of what the tool does, for LLM to understand. */
  description: string;
  /** Zod schema defining the parameters this tool's execute method expects. */
  parameters: TParams; // Changed from parametersSchema
  /**
   * The actual execution logic of the tool.
   * @param params The parameters matching parameters Zod schema.
   * @param executionContext Optional context (e.g., agentId, calling job's ID) if needed.
   * @returns The result of the tool execution.
   */
  execute(params: z.infer<TParams>, executionContext?: any): Promise<TOutput>;
}
