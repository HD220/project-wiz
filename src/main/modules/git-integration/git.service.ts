import { exec } from 'child_process';
import { promisify } from 'util';
import { IGitService } from './domain/git.service.interface';

const execPromise = promisify(exec);

export class GitService implements IGitService {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  private async executeGitCommand(command: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(command, { cwd: this.baseDir });
      if (stderr) {
        console.warn(`Git command stderr: ${stderr}`);
      }
      return stdout;
    } catch (error: unknown) {
      throw new Error(`Git command failed: ${(error as Error).message}`);
    }
  }

  async clone(repoUrl: string, localPath: string): Promise<string> {
    return this.executeGitCommand(`git clone ${repoUrl} ${localPath}`);
  }

  async init(): Promise<string> {
    return this.executeGitCommand(`git init`);
  }

  async pull(): Promise<string> {
    return this.executeGitCommand(`git pull`);
  }
}
