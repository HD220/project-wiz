import * as fs from "fs/promises";

import { injectable, inject } from "inversify";
import { z, ZodAny } from "zod";

import { ILogger } from "@/core/common/services/i-logger.service";
// Corrected import
import { IAgentTool, IToolExecutionContext } from "@/core/tools/tool.interface";

import { ToolError } from "@/domain/common/errors";

import { TYPES } from "@/infrastructure/ioc/types";

import { Result, Ok, Err } from "@/shared/result";

// Prefixed because these are internal schema details, not part of the public tool parameters interface
const _ReadFileParamsSchema = z.object({
  filePath: z.string().describe("The path to the file to read."),
});

// Prefixed
const _WriteFileParamsSchema = z.object({
  filePath: z.string().describe("The path to the file to write."),
  content: z.string().describe("The content to write to the file."),
});

// Prefixed
const _ListFilesParamsSchema = z.object({
  directoryPath: z
    .string()
    .describe("The path to the directory to list files from."),
});

@injectable()
export class FileSystemTool implements IAgentTool<ZodAny, unknown> {
  public readonly name = "fileSystem";
  public readonly description =
    "A tool for interacting with the file system, like reading, writing, and listing files.";

  public readonly parameters = z.object({
    action: z
      .enum(["readFile", "writeFile", "listFiles"])
      .describe("The action to perform."),
    filePath: z
      .string()
      .optional()
      .describe("Path to the file (for readFile, writeFile)."),
    directoryPath: z
      .string()
      .optional()
      .describe("Path to the directory (for listFiles)."),
    content: z
      .string()
      .optional()
      .describe("Content to write (for writeFile)."),
  });

  constructor(
    @inject(TYPES.ILogger) private readonly logger: ILogger
    // Corrected token and type
  ) {
    this.logger.info("[FileSystemTool] initialized");
  }

  async execute(
    params: z.infer<typeof this.parameters>,
    _executionContext?: IToolExecutionContext
  ): Promise<Result<string | string[], ToolError>> {
    this.logger.info(`[FileSystemTool] executing action: ${params.action}`);
    try {
      switch (params.action) {
        case "readFile": {
          if (!params.filePath)
            return Err(new ToolError("filePath is required for readFile."));
          return this._handleReadFile(params.filePath);
        }
        case "writeFile": {
          if (!params.filePath)
            return Err(new ToolError("filePath is required for writeFile."));
          if (!params.content)
            return Err(new ToolError("content is required for writeFile."));
          return this._handleWriteFile(params.filePath, params.content);
        }
        case "listFiles": {
          if (!params.directoryPath)
            return Err(
              new ToolError("directoryPath is required for listFiles.")
            );
          return this._handleListFiles(params.directoryPath);
        }
        default: {
          // This case should ideally be unreachable if Zod validation is exhaustive
          // and all enum members are handled in the switch.
          // params.action is 'never' here. For logging, we might need to cast params itself.
          // However, a generic error message is safest if truly unreachable.
          const actionValue = (params as Record<string, unknown>).action;
          return Err(new ToolError(`Unknown fileSystem action received: ${String(actionValue)}`));
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[FileSystemTool] Error during ${params.action}: ${errorMessage}`
      );
      return Err(
        new ToolError(
          `FileSystemTool action ${params.action} failed: ${errorMessage}`
        )
      );
    }
  }

  private async _handleReadFile(
    filePath: string
  ): Promise<Result<string, ToolError>> {
    if (filePath.includes(".."))
      return Err(new ToolError("Invalid file path (path traversal detected)."));
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return Ok(content);
    } catch (error) {
      return Err(this._createError("readFile", error));
    }
  }

  private async _handleWriteFile(
    filePath: string,
    content: string
  ): Promise<Result<string, ToolError>> {
    if (filePath.includes(".."))
      return Err(new ToolError("Invalid file path (path traversal detected)."));
    try {
      await fs.writeFile(filePath, content, "utf-8");
      return Ok(`File written successfully to ${filePath}`);
    } catch (error) {
      return Err(this._createError("writeFile", error));
    }
  }

  private async _handleListFiles(
    directoryPath: string
  ): Promise<Result<string[], ToolError>> {
    if (directoryPath.includes(".."))
      return Err(
        new ToolError("Invalid directory path (path traversal detected).")
      );
    try {
      const files = await fs.readdir(directoryPath);
      return Ok(files);
    } catch (error) {
      return Err(this._createError("listFiles", error));
    }
  }

  private _createError(action: string, error: unknown): ToolError {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    this.logger.error(
      `[FileSystemTool] Error during ${action}: ${errorMessage}`
    );
    return new ToolError(
      `FileSystemTool action ${action} failed: ${errorMessage}`
    );
  }
}
