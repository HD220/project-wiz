// src/infrastructure/tools/terminal.tool.ts
import { spawn } from 'child_process';
import path from 'path';
import { z } from 'zod';
import { IAgentTool } from '../../core/tools/tool.interface';
import {
  executeCommandParamsSchema,
  ExecuteCommandParams,
  ExecuteCommandResult
} from '../../core/ports/tools/terminal-tool.interface';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

export class TerminalTool {
  private CWD: string; // Secure base CWD for all commands

  constructor(baseCwd: string = process.cwd()) {
    // In a real scenario, ensure baseCwd is a secure, isolated directory.
    // For now, using process.cwd() or a configurable path.
    this.CWD = baseCwd;
    console.log(\`TerminalTool initialized with base CWD: \${this.CWD}\`);
    // Ensure this directory exists, or handle error
    // For simplicity, we assume it exists or commands will handle it.
  }

  private resolvePath(unsafePath?: string): string {
    // Resolve path relative to the tool's CWD.
    // IMPORTANT: Robust sandboxing and validation are critical here.
    const resolvedPath = path.resolve(this.CWD, unsafePath || '.');
    if (!resolvedPath.startsWith(this.CWD)) {
      throw new Error(\`Path traversal detected. Attempted access outside of configured CWD: \${unsafePath}\`);
    }
    // Further checks: ensure path is not pointing to sensitive system areas.
    return resolvedPath;
  }

  async executeCommand(params: ExecuteCommandParams): Promise<ExecuteCommandResult> {
    const { command, workingDirectory, timeout = DEFAULT_TIMEOUT } = params;
    const cwd = this.resolvePath(workingDirectory);

    console.log(\`TerminalTool: Executing command '\${command}' in \${cwd}\`);

    return new Promise<ExecuteCommandResult>((resolve) => {
      // Security: Basic command sanitization/validation might be needed here.
      // For example, disallow certain characters or commands if not using a strict whitelist.
      // Whitelisting allowed commands is the safest approach.
      // For this example, we proceed with the given command but acknowledge the risk.

      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      let stdout = '';
      let stderr = '';
      let processError: Error | undefined;

      const child = spawn(cmd, args, { cwd, shell: true, timeout }); // shell:true can be risky, consider alternatives

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('error', (err) => {
        console.error(\`TerminalTool: Failed to start command '\${command}':\`, err);
        processError = err;
        // 'close' will still be called, or 'exit' if it manages to emit it.
      });

      child.on('close', (code, signal) => {
        console.log(\`TerminalTool: Command '\${command}' finished with code \${code}, signal \${signal}\`);
        if (processError) { // Error during spawn itself
            resolve({ stdout, stderr, exitCode: code, error: \`Spawn error: \${processError.message}\` });
        } else if (signal === 'SIGTERM' && timeout && child.killed) { // Killed by timeout (SIGTERM might be null if process exits quickly after timeout signal)
             resolve({ stdout, stderr, exitCode: code, error: \`Command timed out after \${timeout}ms and was killed.\` });
        } else if (signal) { // Other signals
            resolve({ stdout, stderr, exitCode: code, error: \`Command terminated by signal: \${signal}.\` });
        }
        else {
            resolve({ stdout, stderr, exitCode: code });
        }
      });
    });
  }
}

// Function to generate IAgentTool definitions for TerminalTool
export function getTerminalToolDefinitions(terminalToolInstance: TerminalTool): IAgentTool[] {
  return [
    {
      name: 'terminal.executeCommand',
      description: 'Executes a shell command in a secure environment and returns its output, error, and exit code. Use for build steps, running scripts, linters, etc. Ensure commands are safe and within project scope.',
      parameters: executeCommandParamsSchema,
      execute: async (params: ExecuteCommandParams, executionContext?: any) => {
        // executionContext could be used to pass agentId for logging or further CWD scoping
        return terminalToolInstance.executeCommand(params);
      }
    }
    // Potentially other terminal-related tools like 'startLongRunningCommand', 'checkCommandStatus' later
  ];
}
