import { IpcMainEvent } from "electron";
import { runShellCommand } from "../shell.service";
import { promises as fs } from "fs";
import path from "path";
import logger from "@/main/logger";

export class AgentToolExecutorService {
  constructor() {}

  async executeTool(tool: string, args: any, projectPath: string): Promise<any> {
    logger.info(`Executing agent tool: ${tool} with args: ${JSON.stringify(args)}`);
    switch (tool) {
      case "readFile":
        return this.readFile(projectPath, args.path);
      case "writeFile":
        return this.writeFile(projectPath, args.path, args.content);
      case "executeShell":
        return this.executeShell(projectPath, args.command, args.args);
      case "listDirectory":
        return this.listDirectory(projectPath, args.path);
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  private async readFile(projectPath: string, filePath: string): Promise<string> {
    const fullPath = path.join(projectPath, filePath);
    logger.info(`Reading file: ${fullPath}`);
    return fs.readFile(fullPath, "utf-8");
  }

  private async writeFile(projectPath: string, filePath: string, content: string): Promise<void> {
    const fullPath = path.join(projectPath, filePath);
    logger.info(`Writing file: ${fullPath}`);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  }

  private async executeShell(
    projectPath: string,
    command: string,
    args: string[],
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    logger.info(`Executing shell command: ${command} ${args.join(" ")} in ${projectPath}`);
    return runShellCommand(command, args, projectPath);
  }

  private async listDirectory(projectPath: string, dirPath: string): Promise<string[]> {
    const fullPath = path.join(projectPath, dirPath);
    logger.info(`Listing directory: ${fullPath}`);
    return fs.readdir(fullPath);
  }
}
