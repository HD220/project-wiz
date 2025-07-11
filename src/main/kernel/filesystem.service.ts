import { promises as fs } from 'fs';
import path from 'path';
import logger from '@/main/logger';

export class FilesystemService {
  constructor(private readonly projectRoot: string) {}

  private getAbsolutePath(relativePath: string): string {
    const absolutePath = path.join(this.projectRoot, relativePath);
    // Basic security check: ensure the path is within the project root
    if (!absolutePath.startsWith(this.projectRoot)) {
      throw new Error(`Access denied: Path ${relativePath} is outside project root.`);
    }
    return absolutePath;
  }

  async readFile(relativePath: string): Promise<string> {
    const absolutePath = this.getAbsolutePath(relativePath);
    logger.info(`Reading file: ${absolutePath}`);
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      return content;
    } catch (error: any) {
      logger.error(`Failed to read file ${absolutePath}: ${error.message}`);
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(relativePath);
    logger.info(`Writing file: ${absolutePath}`);
    try {
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
    } catch (error: any) {
      logger.error(`Failed to write file ${absolutePath}: ${error.message}`);
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  async listDirectory(relativePath: string = '.'): Promise<string[]> {
    const absolutePath = this.getAbsolutePath(relativePath);
    logger.info(`Listing directory: ${absolutePath}`);
    try {
      const entries = await fs.readdir(absolutePath);
      return entries;
    } catch (error: any) {
      logger.error(`Failed to list directory ${absolutePath}: ${error.message}`);
      throw new Error(`Failed to list directory: ${error.message}`);
    }
  }

  async createDirectory(relativePath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(relativePath);
    logger.info(`Creating directory: ${absolutePath}`);
    try {
      await fs.mkdir(absolutePath, { recursive: true });
    } catch (error: any) {
      logger.error(`Failed to create directory ${absolutePath}: ${error.message}`);
      throw new Error(`Failed to create directory: ${error.message}`);
    }
  }

  async deletePath(relativePath: string): Promise<void> {
    const absolutePath = this.getAbsolutePath(relativePath);
    logger.info(`Deleting path: ${absolutePath}`);
    try {
      const stats = await fs.stat(absolutePath);
      if (stats.isDirectory()) {
        await fs.rm(absolutePath, { recursive: true, force: true });
      } else {
        await fs.unlink(absolutePath);
      }
    } catch (error: any) {
      logger.error(`Failed to delete path ${absolutePath}: ${error.message}`);
      throw new Error(`Failed to delete path: ${error.message}`);
    }
  }
}