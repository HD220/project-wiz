import * as fs from "fs/promises";
import * as path from "path";

export class FilesystemService {
  private projectBaseDir: string;

  constructor(projectBaseDir: string) {
    this.projectBaseDir = projectBaseDir;
  }

  private getAbsolutePath(relativePath: string): string {
    return path.join(this.projectBaseDir, relativePath);
  }

  async readFile(relativePath: string): Promise<string> {
    const absolutePath = this.getAbsolutePath(relativePath);
    try {
      return await fs.readFile(absolutePath, { encoding: "utf8" });
    } catch (error: unknown) {
      throw new Error(
        `Failed to read file ${relativePath}: ${(error as Error).message}`,
      );
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(relativePath);
    try {
      await fs.writeFile(absolutePath, content, { encoding: "utf8" });
    } catch (error: unknown) {
      throw new Error(
        `Failed to write file ${relativePath}: ${(error as Error).message}`,
      );
    }
  }

  async listDirectory(relativePath: string): Promise<string[]> {
    const absolutePath = this.getAbsolutePath(relativePath);
    try {
      const entries = await fs.readdir(absolutePath);
      return entries;
    } catch (error: unknown) {
      throw new Error(
        `Failed to list directory ${relativePath}: ${(error as Error).message}`,
      );
    }
  }

  async searchFileContent(
    relativePath: string,
    pattern: string,
  ): Promise<string[]> {
    const absolutePath = this.getAbsolutePath(relativePath);
    try {
      const content = await fs.readFile(absolutePath, { encoding: "utf8" });
      const lines = content.split(/\r?\n/);
      const regex = new RegExp(pattern);
      const matchingLines: string[] = [];
      lines.forEach((line) => {
        if (regex.test(line)) {
          matchingLines.push(line);
        }
      });
      return matchingLines;
    } catch (error: unknown) {
      throw new Error(
        `Failed to search file content in ${relativePath}: ${(error as Error).message}`,
      );
    }
  }
}
