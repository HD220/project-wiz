// src/infrastructure/tools/execute-command.tool.ts
import { injectable, inject } from 'inversify';
import { ITool } from '@/domain/services/i-tool-registry.service'; // ITool now expects parametersSchema
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import { exec, ExecOptions } from 'child_process';
import * as path from 'path';
import { z } from 'zod'; // Added

// This should be configured securely, e.g., per-job worktree or a designated workspace.
// It MUST NOT be a general-purpose command execution tool without strict sandboxing.
// For Git commands, this would be the root of the specific git worktree.
const DEFAULT_WORKING_DIR = process.env.AGENT_COMMAND_WORKING_DIR || './agent_command_workspace';

@injectable()
export class ExecuteCommandTool implements ITool {
  readonly name = "execute_command";
  readonly description = "Executes a shell command in a sandboxed environment. Use with extreme caution.";

  readonly parametersSchema = z.object({
    command: z.string().min(1, "Command is required."),
    args: z.array(z.string()).optional().default([]), // Defaults to empty array if not provided
    working_directory: z.string().optional(),
    timeout: z.number().int().positive("Timeout must be a positive integer.").optional().default(60000), // Default 60s
  });

  constructor(@inject(TYPES.ILoggerService) private logger: ILoggerService) {
    this.logger.info(`[ExecuteCommandTool] Initialized. Default working directory: ${path.resolve(DEFAULT_WORKING_DIR)}`);
    // Ensure default working directory exists
    const fs = require('fs'); // Using require here for synchronous check during init
    if (!fs.existsSync(DEFAULT_WORKING_DIR)) {
      fs.mkdirSync(DEFAULT_WORKING_DIR, { recursive: true });
    }
  }

  private async resolveSafeWorkingDirectory(requestedDir?: string): Promise<string> {
    const baseDir = path.resolve(DEFAULT_WORKING_DIR);
    let finalDir = baseDir;

    if (requestedDir) {
      finalDir = path.resolve(path.join(baseDir, requestedDir));
    }

    if (!finalDir.startsWith(baseDir)) {
      this.logger.error(`[ExecuteCommandTool] Path traversal attempt for working directory. Requested: ${requestedDir}, Resolved: ${finalDir}, Base: ${baseDir}`);
      throw new Error(`Working directory path traversal attempt detected. Access denied for: ${requestedDir}`);
    }

    // Ensure the directory exists
    try {
        const fsPromises = require('fs/promises'); // Use require for fs/promises as well for consistency if needed
        await fsPromises.mkdir(finalDir, { recursive: true });
    } catch (e: any) {
        if (e.code !== 'EEXIST') throw e;
    }
    return finalDir;
  }

  // Updated execute method signature
  async execute(args: z.infer<typeof this.parametersSchema>): Promise<any> {
    // Command presence is validated by Zod if ToolRegistry parses first.

    // Security: Basic validation to prevent some obvious misuse.
    // This is NOT a comprehensive security solution.
    const forbiddenCommands = ['rm -rf /', 'mkfs', '>', '<', '|', '&&', ';']; // Very basic list
    if (forbiddenCommands.some(fc => args.command.includes(fc))) {
        this.logger.error(`[ExecuteCommandTool] Potentially dangerous command detected: ${args.command}`);
        throw new Error("Command contains potentially dangerous characters or patterns.");
    }
    // Further validation: disallow relative paths in command itself, e.g. `../some_script`
    // This check was commented out in the prompt, retaining that.
    // if (args.command.match(/\.\.|\//) && !args.command.startsWith("git")) {
    //     this.logger.error(`[ExecuteCommandTool] Command should not contain path elements: ${args.command}`);
    //     throw new Error("Command should not contain path elements. Use working_directory for context.");
    // }

    const safeWorkingDirectory = await this.resolveSafeWorkingDirectory(args.working_directory);

    // args.args and args.timeout have defaults from Zod schema
    const commandToExecute = args.args.length > 0 ? `${args.command} ${args.args.join(' ')}` : args.command;

    this.logger.info(`[ExecuteCommandTool] Executing command: "${commandToExecute}" in directory: "${safeWorkingDirectory}" with timeout ${args.timeout}ms`);

    const execOptions: ExecOptions = {
      cwd: safeWorkingDirectory,
      timeout: args.timeout, // Use Zod-provided default if args.timeout was undefined
    };

    return new Promise((resolve, reject) => {
      exec(commandToExecute, execOptions, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`[ExecuteCommandTool] Error executing command: "${commandToExecute}". Code: ${error.code}. Stderr: ${stderr.trim()}`);
          reject(new Error(`Command failed with code ${error.code}: ${error.message}. Stderr: ${stderr.trim()}`));
          return;
        }
        this.logger.info(`[ExecuteCommandTool] Command "${commandToExecute}" executed successfully. Stdout len: ${stdout.length}, Stderr len: ${stderr.length}`);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
        });
      });
    });
  }
}
