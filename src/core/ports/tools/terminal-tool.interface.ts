// src/core/ports/tools/terminal-tool.interface.ts
import { z } from 'zod';

export const executeCommandParamsSchema = z.object({
  command: z.string().describe("The shell command to execute."),
  workingDirectory: z.string().optional().describe("The working directory to execute the command in. Defaults to a pre-configured secure base CWD for the tool if not provided."),
  timeout: z.number().optional().describe("Timeout in milliseconds for the command execution."),
}).describe("Parameters for executing a shell command.");

export type ExecuteCommandParams = z.infer<typeof executeCommandParamsSchema>;

export interface ExecuteCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | null; // null if process was killed due to timeout or other signal
  error?: string; // For errors during spawn itself, not stderr content
}

// ITerminalToolClass is not strictly needed as per the refined plan.
// IAgentTool definitions will use methods from the concrete TerminalTool instance.
