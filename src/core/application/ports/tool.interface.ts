import { ZodSchema } from 'zod'; // Using Zod for parameter schema definition

// Define a ToolOutput type/interface if specific structure is needed
export interface ToolOutput {
  success: boolean;
  result?: any; // Placeholder for tool execution result
  error?: string;
  // Potentially other metadata
}

export interface ToolInputParameters extends Record<string, any> {}


export interface ITool<TInput extends ToolInputParameters = ToolInputParameters> {
  readonly name: string;
  readonly description: string;
  // Using Zod for parameters schema. Could also be JSONSchema7Definition.
  readonly parametersSchema: ZodSchema<TInput>;
  execute(args: TInput, agentId?: string /* AgentId for context/logging */): Promise<ToolOutput>;
}
