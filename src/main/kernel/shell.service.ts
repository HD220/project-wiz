import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '@/main/logger';

const execPromise = promisify(exec);

export class ShellService {
  /**
   * Executes a shell command.
   * @param command The command to execute.
   * @param args Arguments for the command.
   * @param cwd The current working directory for the command.
   * @returns The stdout, stderr, and exit code of the command.
   */
  async executeCommand(
    command: string,
    args: string[],
    cwd: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const fullCommand = `${command} ${args.join(' ')}`;
    logger.info(`Executing shell command: ${fullCommand} in ${cwd}`);

    try {
      const { stdout, stderr } = await execPromise(fullCommand, { cwd });
      logger.info(`Command stdout: ${stdout}`);
      if (stderr) logger.warn(`Command stderr: ${stderr}`);
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      logger.error(`Failed to execute command: ${error.message}. Stderr: ${error.stderr}`);
      return { stdout: error.stdout, stderr: error.stderr, exitCode: error.code || 1 };
    }
  }
}

// Export a standalone function for convenience
const shellService = new ShellService();
export async function runShellCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return shellService.executeCommand(command, args, cwd);
}
