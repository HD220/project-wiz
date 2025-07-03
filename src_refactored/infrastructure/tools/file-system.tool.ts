import * as fs from 'fs/promises';

import { injectable, inject } from 'inversify';
import { z, ZodAny } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service';
// Corrected import
import { IAgentTool, IToolExecutionContext } from '@/core/tools/tool.interface';

import { ToolError } from '@/domain/common/errors';

import { TYPES } from '@/infrastructure/ioc/types';

// Prefixed because these are internal schema details, not part of the public tool parameters interface
const _ReadFileParamsSchema = z.object({
  filePath: z.string().describe('The path to the file to read.'),
});

// Prefixed
const _WriteFileParamsSchema = z.object({
  filePath: z.string().describe('The path to the file to write.'),
  content: z.string().describe('The content to write to the file.'),
});

// Prefixed
const _ListFilesParamsSchema = z.object({
  directoryPath: z
    .string()
    .describe('The path to the directory to list files from.'),
});

@injectable()
export class FileSystemTool implements IAgentTool<typeof FileSystemTool.prototype.parameters, unknown> {
  public readonly name = 'fileSystem';
  public readonly description =
    'A tool for interacting with the file system, like reading, writing, and listing files.';

  public readonly parameters = z.object({
    action: z
      .enum(['readFile', 'writeFile', 'listFiles'])
      .describe('The action to perform.'),
    filePath: z
      .string()
      .optional()
      .describe('Path to the file (for readFile, writeFile).'),
    directoryPath: z
      .string()
      .optional()
      .describe('Path to the directory (for listFiles).'),
    content: z
      .string()
      .optional()
      .describe('Content to write (for writeFile).'),
  });

  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger,
  ) {
    this.logger.info('[FileSystemTool] initialized');
  }

  async execute(
    params: z.infer<typeof this.parameters>,
    _executionContext?: IToolExecutionContext,
  ): Promise<string | string[]> {
    this.logger.info(`[FileSystemTool] executing action: ${params.action}`);
    try {
      switch (params.action) {
        case 'readFile': {
          if (!params.filePath) {
            throw new ToolError('filePath is required for readFile.');
          }
          return this._handleReadFile(params.filePath);
        }
        case 'writeFile': {
          if (!params.filePath) {
            throw new ToolError('filePath is required for writeFile.');
          }
          if (params.content === undefined) {
            throw new ToolError('content is required for writeFile.');
          }
          return this._handleWriteFile(params.filePath, params.content);
        }
        case 'listFiles': {
          if (!params.directoryPath) {
            throw new ToolError('directoryPath is required for listFiles.');
          }
          return this._handleListFiles(params.directoryPath);
        }
        default: {
          const actionValue = (params as Record<string, unknown>).action;
          throw new ToolError(
            `Unknown fileSystem action received: ${String(actionValue)}`,
          );
        }
      }
    } catch (error: unknown) {
      throw this._createError(params.action, error);
    }
  }

  private async _handleReadFile(filePath: string): Promise<string> {
    if (filePath.includes('..')) {
      throw new ToolError('Invalid file path (path traversal detected).');
    }
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      throw this._createError('readFile', error);
    }
  }

  private async _handleWriteFile(
    filePath: string,
    content: string,
  ): Promise<string> {
    if (filePath.includes('..')) {
      throw new ToolError('Invalid file path (path traversal detected).');
    }
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return `File written successfully to ${filePath}`;
    } catch (error) {
      throw this._createError('writeFile', error);
    }
  }

  private async _handleListFiles(directoryPath: string): Promise<string[]> {
    if (directoryPath.includes('..')) {
      throw new ToolError('Invalid directory path (path traversal detected).');
    }
    try {
      const files = await fs.readdir(directoryPath);
      return files;
    } catch (error) {
      throw this._createError('listFiles', error);
    }
  }

  private _createError(action: string, error: unknown): ToolError {
    if (error instanceof ToolError) {
      return error;
    }
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    this.logger.error(
      `[FileSystemTool] Error during ${action}: ${errorMessage}`,
    );
    return new ToolError(
      `FileSystemTool action ${action} failed: ${errorMessage}`,
    );
  }
}
