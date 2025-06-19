// src/infrastructure/tools/filesystem.tool.ts
import { injectable, inject } from 'inversify';
import { ITool, ToolParameter } from '@/domain/services/i-tool-registry.service';
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import * as fs from 'fs/promises'; // Using fs/promises for async operations
import * as path from 'path';

// Define a base path to restrict operations, this is CRUCIAL for security.
// This should be configured securely, e.g., per-job worktree or a designated workspace.
// For now, a placeholder. In a real scenario, this path would be dynamic and controlled.
const SAFE_BASE_PATH = process.env.AGENT_FILESYSTEM_BASE_PATH || './agent_workspace'; // Example

// Helper function to ensure path is within the safe base path
async function resolveSafely(unsafePath: string): Promise<string> {
  const resolvedPath = path.resolve(path.join(SAFE_BASE_PATH, unsafePath));
  // Ensure the resolved path is still within or equal to the SAFE_BASE_PATH
  if (!resolvedPath.startsWith(path.resolve(SAFE_BASE_PATH))) {
    throw new Error(`Path traversal attempt detected. Access denied for path: ${unsafePath}`);
  }
  // Create base directory if it doesn't exist (for write operations)
  // This is a simplified way; more robust checks might be needed.
  try {
    await fs.mkdir(SAFE_BASE_PATH, { recursive: true });
  } catch (e: any) {
    if (e.code !== 'EEXIST') throw e; // Ignore if directory already exists
  }
  return resolvedPath;
}


@injectable()
export class FileSystemTool implements ITool {
  readonly name = "file_system_tool";
  readonly description = "Perform file system operations like reading, writing, and listing files/directories within a sandboxed environment.";
  readonly parameters: ToolParameter[] = [
    { name: "operation", type: "string", description: "The operation to perform: 'read', 'write', 'list', 'mkdir', 'delete_file', 'delete_dir'", required: true },
    { name: "path", type: "string", description: "Relative path to the file or directory within the agent's workspace.", required: true },
    { name: "content", type: "string", description: "Content to write (for 'write' operation). Base64 encoded for binary.", required: false },
    { name: "recursive", type: "boolean", description: "Recursive operation (for 'list' or 'delete_dir').", required: false },
    { name: "encoding", type: "string", description: "Encoding for read/write operations (e.g., 'utf8', 'base64'). Default: 'utf8'", required: false },
  ];

  constructor(@inject(TYPES.ILoggerService) private logger: ILoggerService) {
    this.logger.info(`[FileSystemTool] Initialized. Base path: ${path.resolve(SAFE_BASE_PATH)}`);
  }

  async execute(args: {
    operation: 'read' | 'write' | 'list' | 'mkdir' | 'delete_file' | 'delete_dir';
    path: string;
    content?: string;
    recursive?: boolean;
    encoding?: BufferEncoding;
  }): Promise<any> {
    this.logger.info(`[FileSystemTool] Executing operation '${args.operation}' on path '${args.path}'`);
    if (!args.path) throw new Error("Path is required.");

    const safePath = await resolveSafely(args.path);
    const encoding = args.encoding || 'utf8';

    switch (args.operation) {
      case 'read':
        try {
          const content = await fs.readFile(safePath, { encoding });
          return content;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error reading file ${safePath}: ${error.message}`);
          throw error;
        }

      case 'write':
        if (args.content === undefined || args.content === null) throw new Error("Content is required for write operation.");
        try {
          // Ensure parent directory exists
          const parentDir = path.dirname(safePath);
          if (parentDir !== SAFE_BASE_PATH && parentDir !== path.resolve(SAFE_BASE_PATH)) { // Avoid trying to create SAFE_BASE_PATH itself via dirname
             await fs.mkdir(parentDir, { recursive: true });
          }
          await fs.writeFile(safePath, args.content, { encoding });
          return `File written successfully to ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error writing file ${safePath}: ${error.message}`);
          throw error;
        }

      case 'list':
        try {
          const items = await fs.readdir(safePath, { withFileTypes: true });
          return items.map(item => ({
            name: item.name,
            isDirectory: item.isDirectory(),
            isFile: item.isFile(),
          }));
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error listing directory ${safePath}: ${error.message}`);
          throw error;
        }

      case 'mkdir':
        try {
          await fs.mkdir(safePath, { recursive: args.recursive ?? false });
          return `Directory created successfully at ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error creating directory ${safePath}: ${error.message}`);
          throw error;
        }

      case 'delete_file':
        try {
          await fs.unlink(safePath); // fs.rm for files in newer Node, but unlink is common
          return `File deleted successfully from ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error deleting file ${safePath}: ${error.message}`);
          throw error;
        }

      case 'delete_dir':
        try {
          await fs.rmdir(safePath, { recursive: args.recursive ?? false }); // fs.rm in newer Node
          return `Directory deleted successfully from ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error deleting directory ${safePath}: ${error.message}`);
          // Add specific check for ENOTEMPTY if not recursive and dir not empty
          if (error.code === 'ENOTEMPTY' && !args.recursive) {
            throw new Error(`Directory ${args.path} is not empty. Use recursive option to delete.`);
          }
          throw error;
        }

      default:
        this.logger.warn(`[FileSystemTool] Unknown operation: ${args.operation}`);
        throw new Error(`Unknown file system operation: ${args.operation}`);
    }
  }
}

// Ensure the tool is registered with the ToolRegistry.
// This would typically be done in the inversify.config.ts or a similar setup file
// by resolving the ToolRegistry and calling registerTool.
// For now, the ToolRegistry auto-registers its dummy tools.
// A more robust system would involve explicitly registering this FileSystemTool.
