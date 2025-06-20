// src/infrastructure/tools/filesystem.tool.ts
import { injectable, inject } from 'inversify';
import { ITool } from '@/domain/services/i-tool-registry.service'; // ITool now expects parametersSchema
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';
import * as fs from 'fs/promises'; // Using fs/promises for async operations
import * as path from 'path';
import { z } from 'zod'; // Added

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
  // Create base directory if it doesn't exist
  try {
    await fs.mkdir(path.resolve(SAFE_BASE_PATH), { recursive: true });
  } catch (e: any) {
    if (e.code !== 'EEXIST') throw e; // Ignore if directory already exists
  }
  return resolvedPath;
}


@injectable()
export class FileSystemTool implements ITool {
  readonly name = "file_system_tool";
  readonly description = "Perform file system operations like reading, writing, and listing files/directories within a sandboxed environment.";

  // NEW Zod schema for parameters
  readonly parametersSchema = z.object({
    operation: z.enum(['read', 'write', 'list', 'mkdir', 'delete_file', 'delete_dir']),
    path: z.string().min(1, "Path is required."), // Zod handles the non-empty check
    content: z.string().optional(),
    recursive: z.boolean().optional().default(false), // Default for optional booleans is good practice
    encoding: z.custom<BufferEncoding>((val) => typeof val === 'string', { // Basic check for string
        message: "Encoding must be a string if provided",
    }).optional().default('utf8'),
  });

  constructor(@inject(TYPES.ILoggerService) private logger: ILoggerService) {
    this.logger.info(`[FileSystemTool] Initialized. Base path: ${path.resolve(SAFE_BASE_PATH)}`);
  }

  // Updated execute method signature
  async execute(args: z.infer<typeof this.parametersSchema>): Promise<any> {
    // Accessing args.encoding is safe due to .default('utf8') in schema
    this.logger.info(`[FileSystemTool] Executing operation '${args.operation}' on path '${args.path}' with encoding '${args.encoding}'`);

    // Path validation (non-empty) is now handled by Zod schema if ToolRegistry validates before calling.
    // For safety, if called directly, args.path would be validated by Zod's inference.

    const safePath = await resolveSafely(args.path);

    switch (args.operation) {
      case 'read':
        try {
          const content = await fs.readFile(safePath, { encoding: args.encoding });
          return content;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error reading file ${safePath}: ${error.message}`);
          throw error; // Re-throw the original error for the caller to handle
        }

      case 'write':
        if (args.content === undefined) { // Content is optional in schema overall, but logically required for 'write'
             this.logger.error("[FileSystemTool] Content is required for write operation but was not provided.");
             throw new Error("Content is required for write operation.");
        }
        try {
          // Ensure parent directory exists within SAFE_BASE_PATH
          const parentDir = path.dirname(safePath);
          if (parentDir.startsWith(path.resolve(SAFE_BASE_PATH)) && parentDir !== path.resolve(SAFE_BASE_PATH)) {
             await fs.mkdir(parentDir, { recursive: true });
          } else if (!parentDir.startsWith(path.resolve(SAFE_BASE_PATH))) {
            // This case should ideally be caught by resolveSafely if safePath itself is correct,
            // but double-checking dirname is an extra layer if safePath is SAFE_BASE_PATH/file.txt
            this.logger.error(`[FileSystemTool] Attempt to write to a directory structure outside sandbox: ${parentDir}`);
            throw new Error("Cannot write to a directory structure outside the sandboxed environment.");
          }
          // If parentDir is SAFE_BASE_PATH, fs.mkdir would have ensured it exists or this call is fine.

          await fs.writeFile(safePath, args.content, { encoding: args.encoding });
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
          await fs.mkdir(safePath, { recursive: args.recursive }); // args.recursive has default from Zod
          return `Directory created successfully at ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error creating directory ${safePath}: ${error.message}`);
          throw error;
        }

      case 'delete_file':
        try {
          await fs.unlink(safePath);
          return `File deleted successfully from ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error deleting file ${safePath}: ${error.message}`);
          throw error;
        }

      case 'delete_dir':
        try {
          // Using fs.rmdir for consistency with prompt, though fs.rm is more modern.
          // args.recursive has its default from Zod.
          await fs.rmdir(safePath, { recursive: args.recursive });
          return `Directory deleted successfully from ${args.path}`;
        } catch (error: any) {
          this.logger.error(`[FileSystemTool] Error deleting directory ${safePath}: ${error.message}`);
          if (error.code === 'ENOTEMPTY' && !args.recursive) {
            throw new Error(`Directory '${args.path}' is not empty. Use recursive option to delete or ensure it's empty.`);
          }
          throw error;
        }

      default:
        // This case should ideally not be reached if the operation enum is exhaustive
        // and Zod validation is performed by the caller (ToolRegistry).
        const exhaustiveCheck: never = args.operation;
        this.logger.error(`[FileSystemTool] Unknown operation encountered: ${exhaustiveCheck}`);
        throw new Error(`Unknown file system operation: ${exhaustiveCheck}`);
    }
  }
}
