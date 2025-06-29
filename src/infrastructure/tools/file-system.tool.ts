// src/infrastructure/tools/file-system.tool.ts
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

// Define Zod schemas for parameters for each method

const pathSchema = z.string().describe("The path to the file or directory.");
const contentSchema = z.string().describe("The content to write to the file.");
const sourcePathSchema = z.string().describe("The source path of the file or directory.");
const destinationPathSchema = z.string().describe("The destination path for the file or directory.");

export const readFileParamsSchema = z.object({ filePath: pathSchema });
export const writeFileParamsSchema = z.object({ filePath: pathSchema, content: contentSchema });
export const moveFileParamsSchema = z.object({ sourcePath: sourcePathSchema, destinationPath: destinationPathSchema });
export const removeFileParamsSchema = z.object({ filePath: pathSchema });

export const listDirectoryParamsSchema = z.object({ dirPath: pathSchema });
export const createDirectoryParamsSchema = z.object({ dirPath: pathSchema });
export const moveDirectoryParamsSchema = z.object({ sourcePath: sourcePathSchema, destinationPath: destinationPathSchema });
export const removeDirectoryParamsSchema = z.object({ dirPath: pathSchema });

// Interface for the FileSystemTool
export interface IFileSystemTool {
  readFile(params: z.infer<typeof readFileParamsSchema>): Promise<string>;
  writeFile(params: z.infer<typeof writeFileParamsSchema>): Promise<void>;
  moveFile(params: z.infer<typeof moveFileParamsSchema>): Promise<void>;
  removeFile(params: z.infer<typeof removeFileParamsSchema>): Promise<void>;
  listDirectory(params: z.infer<typeof listDirectoryParamsSchema>): Promise<string[]>;
  createDirectory(params: z.infer<typeof createDirectoryParamsSchema>): Promise<void>;
  moveDirectory(params: z.infer<typeof moveDirectoryParamsSchema>): Promise<void>;
  removeDirectory(params: z.infer<typeof removeDirectoryParamsSchema>): Promise<void>;
}

// Implementation of the FileSystemTool
export class FileSystemTool implements IFileSystemTool {
  // Base path for operations, could be configurable for sandboxing
  private CWD: string;

  constructor(basePath: string = process.cwd()) {
    // For safety, ensure basePath is within project or a designated safe area if needed.
    // For now, using current working directory or a provided path.
    this.CWD = basePath;
    console.log(`FileSystemTool initialized with base path: ${this.CWD}`);
  }

  private resolvePath(unsafePath: string): string {
    // Basic path resolution. IMPORTANT: In a real app, ensure this is sandboxed!
    // This naive version allows access anywhere from CWD.
    // A production tool MUST validate and sanitize paths to prevent directory traversal.
    const resolved = path.resolve(this.CWD, unsafePath);
    // Example of a very basic check (could be much more robust):
    if (!resolved.startsWith(this.CWD)) {
        throw new Error(`Path traversal detected. Attempted access outside of working directory: ${unsafePath}`);
    }
    return resolved;
  }

  async readFile(params: z.infer<typeof readFileParamsSchema>): Promise<string> {
    const safePath = this.resolvePath(params.filePath);
    console.log(`FileSystemTool.readFile: Reading ${safePath}`);
    return fs.readFile(safePath, 'utf-8');
  }

  async writeFile(params: z.infer<typeof writeFileParamsSchema>): Promise<void> {
    const safePath = this.resolvePath(params.filePath);
    console.log(`FileSystemTool.writeFile: Writing to ${safePath}`);
    // Ensure parent directory exists
    await fs.mkdir(path.dirname(safePath), { recursive: true });
    await fs.writeFile(safePath, params.content, 'utf-8');
  }

  async moveFile(params: z.infer<typeof moveFileParamsSchema>): Promise<void> {
    const safeSourcePath = this.resolvePath(params.sourcePath);
    const safeDestinationPath = this.resolvePath(params.destinationPath);
    console.log(`FileSystemTool.moveFile: Moving ${safeSourcePath} to ${safeDestinationPath}`);
    // Ensure parent directory of destination exists
    await fs.mkdir(path.dirname(safeDestinationPath), { recursive: true });
    await fs.rename(safeSourcePath, safeDestinationPath);
  }

  async removeFile(params: z.infer<typeof removeFileParamsSchema>): Promise<void> {
    const safePath = this.resolvePath(params.filePath);
    console.log(`FileSystemTool.removeFile: Removing ${safePath}`);
    await fs.unlink(safePath);
  }

  async listDirectory(params: z.infer<typeof listDirectoryParamsSchema>): Promise<string[]> {
    const safePath = this.resolvePath(params.dirPath);
    console.log(`FileSystemTool.listDirectory: Listing ${safePath}`);
    return fs.readdir(safePath);
  }

  async createDirectory(params: z.infer<typeof createDirectoryParamsSchema>): Promise<void> {
    const safePath = this.resolvePath(params.dirPath);
    console.log(`FileSystemTool.createDirectory: Creating ${safePath}`);
    await fs.mkdir(safePath, { recursive: true });
  }

  async moveDirectory(params: z.infer<typeof moveDirectoryParamsSchema>): Promise<void> {
    const safeSourcePath = this.resolvePath(params.sourcePath);
    const safeDestinationPath = this.resolvePath(params.destinationPath);
    console.log(`FileSystemTool.moveDirectory: Moving directory ${safeSourcePath} to ${safeDestinationPath}`);
    // fs.rename can move directories. Ensure destination parent exists.
    await fs.mkdir(path.dirname(safeDestinationPath), { recursive: true });
    await fs.rename(safeSourcePath, safeDestinationPath);
  }

  async removeDirectory(params: z.infer<typeof removeDirectoryParamsSchema>): Promise<void> {
    const safePath = this.resolvePath(params.dirPath);
    console.log(`FileSystemTool.removeDirectory: Removing directory ${safePath}`);
    // fs.rm with recursive option for non-empty directories, or fs.rmdir for empty.
    // Using fs.rm for robustness.
    await fs.rm(safePath, { recursive: true, force: true }); // force true to not error if path doesn't exist
  }
}

// New function to generate tool definitions for an instance
import { IAgentTool } from '../../core/tools/tool.interface';

export function getFileSystemToolDefinitions(fsToolInstance: FileSystemTool): IAgentTool[] {
  return [
    {
      name: 'fileSystem.readFile',
      description: 'Reads the content of a file at a given path.',
      parameters: readFileParamsSchema,
      execute: async (params) => fsToolInstance.readFile(params),
    },
    {
      name: 'fileSystem.writeFile',
      description: 'Writes content to a file at a given path. Creates directories if they don\'t exist.',
      parameters: writeFileParamsSchema,
      execute: async (params) => fsToolInstance.writeFile(params),
    },
    {
      name: 'fileSystem.moveFile',
      description: 'Moves a file from a source path to a destination path.',
      parameters: moveFileParamsSchema,
      execute: async (params) => fsToolInstance.moveFile(params),
    },
    {
      name: 'fileSystem.removeFile',
      description: 'Deletes a file at the specified path.',
      parameters: removeFileParamsSchema,
      execute: async (params) => fsToolInstance.removeFile(params),
    },
    {
      name: 'fileSystem.listDirectory',
      description: 'Lists all files and directories within a given path.',
      parameters: listDirectoryParamsSchema,
      execute: async (params) => fsToolInstance.listDirectory(params),
    },
    {
      name: 'fileSystem.createDirectory',
      description: 'Creates a new directory at the specified path, including parent directories if needed.',
      parameters: createDirectoryParamsSchema,
      execute: async (params) => fsToolInstance.createDirectory(params),
    },
    {
      name: 'fileSystem.moveDirectory',
      description: 'Moves a directory from a source path to a destination path.',
      parameters: moveDirectoryParamsSchema,
      execute: async (params) => fsToolInstance.moveDirectory(params),
    },
    {
      name: 'fileSystem.removeDirectory',
      description: 'Deletes a directory and its contents recursively at the specified path.',
      parameters: removeDirectoryParamsSchema,
      execute: async (params) => fsToolInstance.removeDirectory(params),
    }
  ];
}
