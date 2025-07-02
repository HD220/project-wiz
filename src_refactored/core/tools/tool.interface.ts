import { z } from "zod";

import { ToolError } from "@/domain/common/errors";

import { Result } from "../../shared/result";

export interface IToolExecutionContext {
  agentId?: string;
  jobId?: string;
  projectId?: string;
  userId?: string;
}

export interface IAgentTool<
  InputSchema extends z.ZodTypeAny,
  TOutput = unknown,
> {
  name: string;
  description: string;
  parameters: InputSchema;
  execute(
    params: z.infer<InputSchema>,
    executionContext?: IToolExecutionContext
  ): Promise<Result<TOutput, ToolError>>;
}

export const IAgentToolToken = Symbol("IAgentTool");
