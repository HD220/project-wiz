// src_refactored/infrastructure/tools/file-system.tool.ts
import * as fs from 'fs/promises';
import * as path from 'path';

import { injectable, inject } from 'inversify';
import { z } from 'zod';

import { ILoggerService } from '@/core/common/services/i-logger.service';
import { IAgentTool, IToolExecutionContext } from '@/core/tools/tool.interface';


import { ToolError } from '@/domain/common/errors';



import { TYPES } from '@/infrastructure/ioc/types'; // Adjusted path

import { Result, Ok, Err } from '@/shared/result';


const ReadFileParamsSchema = z.object({
  filePath: z.string().describe("The path to the file to read."),
});

const WriteFileParamsSchema = z.object({
  filePath: z.string().describe("The path to the file to write."),
  content: z.string().describe("The content to write to the file."),
});

const ListFilesParamsSchema = z.object({
  directoryPath: z.string().describe("The path to the directory to list files from."),
});

@injectable()
export class FileSystemTool implements IAgentTool<any, any> {
  public readonly name = "fileSystem"; // General name, specific actions in description or sub-tools
  public readonly description = "A tool for interacting with the file system, like reading, writing, and listing files.";

  // This parameter schema is a bit too generic for a single tool.
  // Usually, a tool has one specific action and thus one schema.
  // This might be a "Tool Group" or needs to be broken down.
  // For now, using a generic Zod schema as a placeholder.
  public readonly parameters = z.object({
    action: z.enum(["readFile", "writeFile", "listFiles"]).describe("The action to perform."),
    filePath: z.string().optional().describe("Path to the file (for readFile, writeFile)."),
    directoryPath: z.string().optional().describe("Path to the directory (for listFiles)."),
    content: z.string().optional().describe("Content to write (for writeFile)."),
  });

  constructor(@inject(TYPES.ILoggerService) private readonly logger: ILoggerService) {
    this.logger.info('[FileSystemTool] initialized');
  }

  async execute(
    params: z.infer<typeof this.parameters>,
    _executionContext?: IToolExecutionContext,
  ): Promise<Result<string | string[], ToolError>> {
    this.logger.info(`[FileSystemTool] executing action: ${params.action}`);
    try {
      switch (params.action) {
        case "readFile":
          if (!params.filePath) return Err(new ToolError("filePath is required for readFile."));
          // Basic security: prevent path traversal. This is NOT comprehensive.
          if (params.filePath.includes("..")) return Err(new ToolError("Invalid file path (path traversal detected)."));
          const content = await fs.readFile(params.filePath, 'utf-8');
          return Ok(content);
        case "writeFile":
          if (!params.filePath) return Err(new ToolError("filePath is required for writeFile."));
          if (!params.content) return Err(new ToolError("content is required for writeFile."));
          if (params.filePath.includes("..")) return Err(new ToolError("Invalid file path (path traversal detected)."));
          await fs.writeFile(params.filePath, params.content, 'utf-8');
          return Ok(`File written successfully to ${params.filePath}`);
        case "listFiles":
          if (!params.directoryPath) return Err(new ToolError("directoryPath is required for listFiles."));
          if (params.directoryPath.includes("..")) return Err(new ToolError("Invalid directory path (path traversal detected)."));
          const files = await fs.readdir(params.directoryPath);
          return Ok(files);
        default:
          return Err(new ToolError(`Unknown fileSystem action: ${(params as any).action}`));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[FileSystemTool] Error during ${params.action}: ${errorMessage}`);
      return Err(new ToolError(`FileSystemTool action ${params.action} failed: ${errorMessage}`));
    }
  }
}
