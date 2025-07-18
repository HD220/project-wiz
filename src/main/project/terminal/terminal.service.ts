import { spawn } from "child_process";
import path from "path";
import { generateId } from "@/main/utils/id-generator";
import { logger } from "@/main/utils/logger";
import type {
  TerminalLine,
  TerminalSession,
  TerminalCommand,
  TerminalCommandResponse,
} from "@/shared/types/domains/projects/terminal.types";

class TerminalService {
  private sessions: Map<string, TerminalSession> = new Map();

  async createSession(
    projectId: string,
    name: string,
    directory?: string,
  ): Promise<TerminalSession> {
    const sessionId = generateId("term");
    const workingDirectory =
      directory || path.join(process.cwd(), "sample-project");

    const session: TerminalSession = {
      id: sessionId,
      projectId,
      name,
      directory: workingDirectory,
      isActive: true,
      lastActivity: new Date(),
      lines: [
        {
          id: generateId("line"),
          content: `Terminal session started in: ${workingDirectory}`,
          type: "output",
          timestamp: new Date(),
          directory: workingDirectory,
        },
      ],
    };

    this.sessions.set(sessionId, session);
    logger.info(
      `Created terminal session ${sessionId} for project ${projectId}`,
    );

    return session;
  }

  async getSession(sessionId: string): Promise<TerminalSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getProjectSessions(projectId: string): Promise<TerminalSession[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.projectId === projectId,
    );
  }

  async executeCommand(
    sessionId: string,
    command: TerminalCommand,
  ): Promise<TerminalCommandResponse> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Terminal session ${sessionId} not found`);
    }

    const startTime = Date.now();
    const lineId = generateId("line");

    // Add input line
    const inputLine: TerminalLine = {
      id: lineId,
      content: `$ ${command.command}`,
      type: "input",
      timestamp: new Date(),
      directory: command.directory,
    };

    session.lines.push(inputLine);
    session.lastActivity = new Date();

    try {
      const result = await this.runCommand(
        command.command,
        command.directory,
        command.environment,
      );
      const duration = Date.now() - startTime;

      // Add output line
      const outputLine: TerminalLine = {
        id: generateId("line"),
        content: result.output,
        type: result.exitCode === 0 ? "output" : "error",
        timestamp: new Date(),
        directory: command.directory,
        exitCode: result.exitCode,
      };

      session.lines.push(outputLine);

      return {
        sessionId,
        lineId: outputLine.id,
        output: result.output,
        exitCode: result.exitCode,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Add error line
      const errorLine: TerminalLine = {
        id: generateId("line"),
        content: errorMessage,
        type: "error",
        timestamp: new Date(),
        directory: command.directory,
        exitCode: 1,
      };

      session.lines.push(errorLine);

      return {
        sessionId,
        lineId: errorLine.id,
        output: errorMessage,
        exitCode: 1,
        duration,
      };
    }
  }

  private async runCommand(
    command: string,
    directory: string,
    environment?: Record<string, string>,
  ): Promise<{ output: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(" ");

      const childProcess = spawn(cmd, args, {
        cwd: directory,
        env: { ...process.env, ...environment },
        shell: true,
      });

      let output = "";
      let errorOutput = "";

      childProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      childProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      childProcess.on("close", (code) => {
        const finalOutput = output + errorOutput;
        resolve({
          output: finalOutput || `Command completed with exit code ${code}`,
          exitCode: code || 0,
        });
      });

      childProcess.on("error", (error) => {
        reject(error);
      });

      // Set timeout to prevent hanging commands
      setTimeout(() => {
        childProcess.kill();
        reject(new Error("Command timed out"));
      }, 30000); // 30 second timeout
    });
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      logger.info(`Closed terminal session ${sessionId}`);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lines = [];
      session.lastActivity = new Date();
      logger.info(`Cleared terminal session ${sessionId}`);
    }
  }

  async getDefaultSessions(): Promise<TerminalSession[]> {
    // Return some default sessions for development
    const defaultSessions: TerminalSession[] = [
      {
        id: "default-main",
        projectId: "sample-project",
        name: "Main",
        directory: process.cwd(),
        isActive: true,
        lastActivity: new Date(),
        lines: [
          {
            id: generateId("line"),
            content: "Welcome to Project Wiz Terminal",
            type: "output",
            timestamp: new Date(),
          },
          {
            id: generateId("line"),
            content: "$ ls",
            type: "input",
            timestamp: new Date(),
          },
          {
            id: generateId("line"),
            content: "README.md  package.json  src/  docs/",
            type: "output",
            timestamp: new Date(),
          },
        ],
      },
    ];

    return defaultSessions;
  }
}

export const terminalService = new TerminalService();
