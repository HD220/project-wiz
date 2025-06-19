// src/infrastructure/tools/execute-command.tool.ts
import { injectable, inject } from 'inversify';
import { ITool, ToolParameter } from '@/domain/services/i-tool-registry.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import { exec, ExecOptions } from 'child_process';
import * as path from 'path';

// This should be configured securely, e.g., per-job worktree or a designated workspace.
// It MUST NOT be a general-purpose command execution tool without strict sandboxing.
// For Git commands, this would be the root of the specific git worktree.
const DEFAULT_WORKING_DIR = process.env.AGENT_COMMAND_WORKING_DIR || './agent_command_workspace';

@injectable()
export class ExecuteCommandTool implements ITool {
  readonly name = "execute_command";
  readonly description = "Executes a shell command in a sandboxed environment. Use with extreme caution.";
  readonly parameters: ToolParameter[] = [
    { name: "command", type: "string", description: "The shell command to execute.", required: true },
    { name: "args", type: "array", description: "Array of arguments for the command.", required: false, schema: { type: "array", items: { type: "string" } } },
    { name: "working_directory", type: "string", description: "Relative path for the command's working directory within the allowed workspace. Defaults to agent's root workspace.", required: false },
    { name: "timeout", type: "number", description: "Timeout in milliseconds for the command execution.", required: false },
  ];

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
        const fsPromises = require('fs/promises');
        await fsPromises.mkdir(finalDir, { recursive: true });
    } catch (e: any) {
        if (e.code !== 'EEXIST') throw e;
    }
    return finalDir;
  }

  async execute(args: {
    command: string;
    args?: string[];
    working_directory?: string;
    timeout?: number;
  }): Promise<any> {
    if (!args.command) {
      throw new Error("Command is required.");
    }

    // Security: Basic validation to prevent some obvious misuse.
    // This is NOT a comprehensive security solution.
    // A more robust solution would involve allowlisting commands, using containers, etc.
    const forbiddenCommands = ['rm -rf /', 'mkfs', '>', '<', '|', '&&', ';']; // Very basic list
    if (forbiddenCommands.some(fc => args.command.includes(fc))) {
        this.logger.error(`[ExecuteCommandTool] Potentially dangerous command detected: ${args.command}`);
        throw new Error("Command contains potentially dangerous characters or patterns.");
    }
    // Further validation: disallow relative paths in command itself, e.g. `../some_script`
    if (args.command.match(/\.\.|\//) && !args.command.startsWith("git")) { // Allow git commands that might have slashes
        // This is a simplistic check. A proper path resolution and check against allowed paths is better.
        // For now, we rely on the working_directory sandboxing.
        // this.logger.error(`[ExecuteCommandTool] Command should not contain path elements: ${args.command}`);
        // throw new Error("Command should not contain path elements. Use working_directory for context.");
    }


    const safeWorkingDirectory = await this.resolveSafeWorkingDirectory(args.working_directory);
    const commandToExecute = args.args ? `${args.command} ${args.args.join(' ')}` : args.command;

    this.logger.info(`[ExecuteCommandTool] Executing command: "${commandToExecute}" in directory: "${safeWorkingDirectory}"`);

    const execOptions: ExecOptions = {
      cwd: safeWorkingDirectory,
      timeout: args.timeout || 60000, // Default timeout 60 seconds
    };

    return new Promise((resolve, reject) => {
      exec(commandToExecute, execOptions, (error, stdout, stderr) => {
        if (error) {
          this.logger.error(`[ExecuteCommandTool] Error executing command: "${commandToExecute}". Code: ${error.code}. Stderr: ${stderr.trim()}`);
          // Include stderr in the error passed to the LLM for better debugging
          reject(new Error(`Command failed with code ${error.code}: ${error.message}. Stderr: ${stderr.trim()}`));
          return;
        }
        this.logger.info(`[ExecuteCommandTool] Command "${commandToExecute}" executed successfully. Stdout len: ${stdout.length}, Stderr len: ${stderr.length}`);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          // Potentially add exit code if needed, though error implies non-zero
        });
      });
    });
  }
}
